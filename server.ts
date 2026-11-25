import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI, Type } from '@google/genai';

const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
]);

const MAX_BASE64_BYTES = 14 * 1024 * 1024; // ~10MB raw file in base64
const CO2_KG_PER_KWH = 0.82;
const INDIAN_AVG_MONTHLY_KWH = 95;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const err = new Error(
      'GEMINI_API_KEY is not configured. Please set it in Settings > Secrets.'
    ) as Error & { statusCode?: number };
    err.statusCode = 503;
    throw err;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;
      const msg = error instanceof Error ? error.message : String(error);
      const isTransient =
        msg.includes('503') ||
        msg.includes('500') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('ETIMEDOUT');
      if (!isTransient || attempt === maxRetries) {
        throw error;
      }
      await new Promise((r) => setTimeout(r, 600 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}

function formatGeminiError(error: unknown): { status: number; message: string; code: string } {
  const rawMessage = error instanceof Error ? error.message : String(error);
  const statusCode =
    typeof (error as { statusCode?: unknown })?.statusCode === 'number'
      ? (error as { statusCode: number }).statusCode
      : 500;

  if (rawMessage.includes('API_KEY_INVALID') || rawMessage.includes('PERMISSION_DENIED')) {
    return {
      status: 403,
      code: 'API_KEY_INVALID',
      message:
        'Your Gemini API key appears invalid or lacks permission. Please verify it in Settings > Secrets.',
    };
  }
  if (rawMessage.includes('RESOURCE_EXHAUSTED') || rawMessage.includes('429')) {
    return {
      status: 429,
      code: 'RATE_LIMITED',
      message:
        'AI analysis is temporarily busy due to rate limits. Please wait a moment and try again, or try a demo bill.',
    };
  }
  if (statusCode === 503 || rawMessage.includes('GEMINI_API_KEY')) {
    return {
      status: 503,
      code: 'MISSING_API_KEY',
      message: rawMessage,
    };
  }

  return {
    status: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
    code: 'ANALYSIS_FAILED',
    message:
      'We could not process that file cleanly. Please check that the bill image or PDF is clear, or enter your bill numbers manually.',
  };
}

function computeDeterministicScore(monthlyKwh: number): number {
  if (monthlyKwh <= 60) return 96;
  if (monthlyKwh <= 95) {
    return Math.round(95 - ((monthlyKwh - 60) / 35) * 13); // 95 down to 82
  }
  if (monthlyKwh <= 200) {
    return Math.round(82 - ((monthlyKwh - 95) / 105) * 24); // 82 down to 58
  }
  if (monthlyKwh <= 400) {
    return Math.round(58 - ((monthlyKwh - 200) / 200) * 28); // 58 down to 30
  }
  return Math.max(12, Math.round(30 - ((monthlyKwh - 400) / 300) * 18));
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '16mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post('/api/analyze-bill', async (req: Request, res: Response) => {
    try {
      const { fileData, mimeType } = req.body as {
        fileData?: unknown;
        mimeType?: unknown;
      };

      if (typeof fileData !== 'string' || fileData.length < 16) {
        return res.status(400).json({
          code: 'INVALID_FILE',
          message: 'Please upload a valid electricity bill image or PDF file.',
        });
      }

      if (fileData.length > MAX_BASE64_BYTES) {
        return res.status(413).json({
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds 10 MB. Please upload a smaller image or compressed PDF.',
        });
      }

      const normalizedMime =
        typeof mimeType === 'string' ? mimeType.toLowerCase().trim() : '';
      if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
        return res.status(400).json({
          code: 'UNSUPPORTED_FORMAT',
          message: 'Unsupported file type. Please upload a JPG, PNG, WebP image, or PDF bill.',
        });
      }

      // Clean base64 prefix if present
      const base64Clean = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      const geminiMime = normalizedMime === 'image/jpg' ? 'image/jpeg' : normalizedMime;

      const ai = getGeminiClient();

      const extractionPrompt = `You are an expert Indian electricity bill auditor.
Analyze the uploaded document (image or PDF) and extract the electricity bill details for an Indian household.

Look for:
1. unitsConsumed: Total electricity units consumed in kWh (look for "Units", "kWh", "Billed Units", "Total Consumption", or difference between Present & Previous meter reading).
2. totalAmountInr: Total payable bill amount in Indian Rupees (look for "Total Amount", "Net Payable", "Bill Amount", "Amount Payable", "Gross Amount").
3. billingPeriod: Billing cycle / period dates or month (e.g., "01 Oct 2026 - 31 Oct 2026" or "Sep - Oct 2026").
4. tariffRatePerUnit: Energy rate or average tariff per kWh in Rupees. If multiple slabs are listed, compute effective energy rate or totalAmountInr / unitsConsumed if both are present, OR extract the primary residential rate per unit. If only slab rates exist and cannot be determined cleanly, set null if ambiguous, or return the weighted average rate.
5. billingDays: Number of days in the billing period (default 30 for monthly bills, 60 for bi-monthly bills like MSEDCL/TANGEDCO/Kerala KSEB if evident).
6. providerName: Utility / DISCOM name if visible (e.g., Tata Power, BSES Rajdhani, BESCOM, MSEDCL, Adani Electricity, TANGEDCO, PSPCL, UPPCL, CESC, etc.).
7. consumerLocation: City or state if visible.
8. isElectricityBill: true if this document looks like an electricity / power utility bill or meter receipt, false if it is an unrelated photo/document or completely illegible.

CRITICAL RULES:
- Never guess or fabricate numbers that are not present or clearly derivable from the document.
- If a field is blurry, cut off, or missing, return null for that field and include its exact key name in "missingFields" (from: "unitsConsumed", "totalAmountInr", "billingPeriod", "tariffRatePerUnit").
- Provide a short, helpful "extractionNote" in both English ("en") and natural Hindi ("hi") summarizing what was read or telling the user which fields need manual verification.`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: geminiMime,
                  data: base64Clean,
                },
              },
              { text: extractionPrompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isElectricityBill: { type: Type.BOOLEAN },
                providerName: { type: Type.STRING, nullable: true },
                consumerLocation: { type: Type.STRING, nullable: true },
                unitsConsumed: { type: Type.NUMBER, nullable: true },
                totalAmountInr: { type: Type.NUMBER, nullable: true },
                billingPeriod: { type: Type.STRING, nullable: true },
                tariffRatePerUnit: { type: Type.NUMBER, nullable: true },
                billingDays: { type: Type.NUMBER },
                missingFields: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                extractionNote: {
                  type: Type.OBJECT,
                  properties: {
                    en: { type: Type.STRING },
                    hi: { type: Type.STRING },
                  },
                  required: ['en', 'hi'],
                },
              },
              required: [
                'isElectricityBill',
                'billingDays',
                'missingFields',
                'extractionNote',
              ],
            },
          },
        })
      );

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText) as {
        isElectricityBill?: boolean;
        providerName?: string | null;
        consumerLocation?: string | null;
        unitsConsumed?: number | null;
        totalAmountInr?: number | null;
        billingPeriod?: string | null;
        tariffRatePerUnit?: number | null;
        billingDays?: number;
        missingFields?: string[];
        extractionNote?: { en?: string; hi?: string };
      };

      const validUnits =
        typeof parsed.unitsConsumed === 'number' &&
        Number.isFinite(parsed.unitsConsumed) &&
        parsed.unitsConsumed > 0
          ? Number(parsed.unitsConsumed.toFixed(1))
          : null;

      const validAmount =
        typeof parsed.totalAmountInr === 'number' &&
        Number.isFinite(parsed.totalAmountInr) &&
        parsed.totalAmountInr > 0
          ? Number(parsed.totalAmountInr.toFixed(2))
          : null;

      let validTariff =
        typeof parsed.tariffRatePerUnit === 'number' &&
        Number.isFinite(parsed.tariffRatePerUnit) &&
        parsed.tariffRatePerUnit > 0
          ? Number(parsed.tariffRatePerUnit.toFixed(2))
          : null;

      const validPeriod =
        typeof parsed.billingPeriod === 'string' && parsed.billingPeriod.trim().length > 0
          ? parsed.billingPeriod.trim()
          : null;

      // Compute missingFields cleanly
      const missingSet = new Set<string>(
        Array.isArray(parsed.missingFields) ? parsed.missingFields : []
      );
      if (validUnits === null) missingSet.add('unitsConsumed');
      else missingSet.delete('unitsConsumed');

      if (validAmount === null) missingSet.add('totalAmountInr');
      else missingSet.delete('totalAmountInr');

      if (validPeriod === null) missingSet.add('billingPeriod');
      else missingSet.delete('billingPeriod');

      if (validTariff === null) {
        if (validUnits && validAmount) {
          validTariff = Number((validAmount / validUnits).toFixed(2));
          missingSet.delete('tariffRatePerUnit');
        } else {
          missingSet.add('tariffRatePerUnit');
        }
      } else {
        missingSet.delete('tariffRatePerUnit');
      }

      const allowedMissing = ['unitsConsumed', 'totalAmountInr', 'billingPeriod', 'tariffRatePerUnit'];
      const missingFields = Array.from(missingSet).filter((f) => allowedMissing.includes(f));

      const billingDays =
        typeof parsed.billingDays === 'number' &&
        Number.isFinite(parsed.billingDays) &&
        parsed.billingDays >= 7 &&
        parsed.billingDays <= 120
          ? Math.round(parsed.billingDays)
          : 30;

      const defaultNoteEn =
        parsed.isElectricityBill === false
          ? 'This file does not look like a clear electricity bill. You can upload another file or enter your bill details manually below.'
          : missingFields.length > 0
          ? 'We extracted part of your bill. Please fill in or verify the highlighted fields before viewing your report.'
          : 'All key bill fields were extracted. Review or adjust any number below, then continue to your analysis.';

      const defaultNoteHi =
        parsed.isElectricityBill === false
          ? 'यह फ़ाइल स्पष्ट बिजली बिल जैसी नहीं दिख रही है। कृपया दूसरा बिल अपलोड करें या नीचे विवरण मैन्युअल रूप से दर्ज करें।'
          : missingFields.length > 0
          ? 'हमने आपके बिल का कुछ हिस्सा पढ़ लिया है। रिपोर्ट देखने से पहले कृपया छूटे हुए विवरण भरें या जांच लें।'
          : 'बिल के सभी मुख्य विवरण पढ़ लिए गए हैं। नीचे किसी भी मान को जांचें और विश्लेषण देखें।';

      return res.json({
        isElectricityBill: Boolean(parsed.isElectricityBill),
        providerName: parsed.providerName?.trim() || null,
        consumerLocation: parsed.consumerLocation?.trim() || null,
        unitsConsumed: validUnits,
        totalAmountInr: validAmount,
        billingPeriod: validPeriod,
        tariffRatePerUnit: validTariff,
        billingDays,
        missingFields,
        extractionNote: {
          en: parsed.extractionNote?.en?.trim() || defaultNoteEn,
          hi: parsed.extractionNote?.hi?.trim() || defaultNoteHi,
        },
      });
    } catch (error) {
      const formatted = formatGeminiError(error);
      return res.status(formatted.status).json({
        code: formatted.code,
        message: formatted.message,
      });
    }
  });

  app.post('/api/generate-tips', async (req: Request, res: Response) => {
    try {
      const {
        unitsConsumed,
        totalAmountInr,
        billingPeriod,
        tariffRatePerUnit,
        billingDays,
        providerName,
        consumerLocation,
      } = req.body as {
        unitsConsumed?: unknown;
        totalAmountInr?: unknown;
        billingPeriod?: unknown;
        tariffRatePerUnit?: unknown;
        billingDays?: unknown;
        providerName?: unknown;
        consumerLocation?: unknown;
      };

      const units = Number(unitsConsumed);
      const amount = Number(totalAmountInr);
      const rate = Number(tariffRatePerUnit) || (units > 0 ? amount / units : 7);
      const days =
        typeof billingDays === 'number' && Number.isFinite(billingDays) && billingDays >= 7 && billingDays <= 120
          ? Math.round(billingDays)
          : 30;

      if (!Number.isFinite(units) || units <= 0 || units > 50000) {
        return res.status(400).json({
          code: 'INVALID_UNITS',
          message: 'Please enter a valid positive number of units consumed (kWh).',
        });
      }
      if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
        return res.status(400).json({
          code: 'INVALID_AMOUNT',
          message: 'Please enter a valid positive bill amount in rupees.',
        });
      }

      const periodStr =
        typeof billingPeriod === 'string' && billingPeriod.trim()
          ? billingPeriod.trim().slice(0, 80)
          : 'Current Billing Cycle';
      const providerStr =
        typeof providerName === 'string' && providerName.trim()
          ? providerName.trim().slice(0, 80)
          : 'Indian State DISCOM';
      const locationStr =
        typeof consumerLocation === 'string' && consumerLocation.trim()
          ? consumerLocation.trim().slice(0, 80)
          : 'India';

      const monthlyUnitsNormalized = Number(((units * 30) / days).toFixed(1));
      const carbonFootprintKg = Number((units * CO2_KG_PER_KWH).toFixed(1));
      const effectiveCostPerUnit = Number((amount / units).toFixed(2));
      const baselineScore = computeDeterministicScore(monthlyUnitsNormalized);

      const ai = getGeminiClient();

      const tipsPrompt = `You are WattWise, an Indian residential energy efficiency advisor.
A household in ${locationStr} (Provider: ${providerStr}) has the following electricity bill:
- Units consumed: ${units} kWh over ${days} days (~${monthlyUnitsNormalized} kWh/month)
- Total bill amount: ₹${amount}
- Effective cost per unit: ₹${effectiveCostPerUnit}/kWh (stated rate: ₹${rate.toFixed(2)}/kWh)
- Billing period: ${periodStr}
- Carbon footprint: ${carbonFootprintKg} kg CO2 (at 0.82 kg CO2/kWh)
- Average Indian household benchmark: ${INDIAN_AVG_MONTHLY_KWH} kWh/month (90-100 kWh/month)
- Preliminary efficiency score: ${baselineScore}/100

Task:
1. Refine or confirm an efficiencyScore between 0 and 100 (stay within ±5 points of ${baselineScore}) and write a concise 1-2 sentence efficiencyExplanation in both English ("en") and natural conversational Hindi ("hi") comparing their monthly usage to the 90-100 kWh/month Indian household average and their tariff slab.
2. Generate EXACTLY 5 practical, personalized electricity-saving tips tailored specifically to this usage level (${monthlyUnitsNormalized} kWh/month) in an Indian home (e.g., AC at 24°C, BLDC ceiling fans, geyser timer, 5-star inverter fridge, LED replacement, standby phantom load, rooftop solar / off-peak washing machine, depending on whether usage is high >250 kWh, moderate 100-250 kWh, or already low <=100 kWh).
3. For each tip provide:
   - category: one of "cooling", "appliances", "lighting", "standby", "tariff"
   - title: short crisp title in English ("en") and Hindi ("hi")
   - action: single concrete one-line action in English ("en") and Hindi ("hi")
   - monthlyKwhSaved: realistic monthly kWh saved (must sum reasonably to 15%–35% of their monthly kWh, never exceeding their actual monthly consumption)
   - monthlyRupeesSaved: monthlyKwhSaved * ${effectiveCostPerUnit}, rounded to nearest integer ₹

Keep Hindi translations natural, everyday Indian Hindi (Devanagari script), not robotic word-for-word literal translations.`;

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: 'gemini-4-hydrogen',
          contents: tipsPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                efficiencyScore: { type: Type.INTEGER },
                efficiencyExplanation: {
                  type: Type.OBJECT,
                  properties: {
                    en: { type: Type.STRING },
                    hi: { type: Type.STRING },
                  },
                  required: ['en', 'hi'],
                },
                tips: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      category: { type: Type.STRING },
                      title: {
                        type: Type.OBJECT,
                        properties: {
                          en: { type: Type.STRING },
                          hi: { type: Type.STRING },
                        },
                        required: ['en', 'hi'],
                      },
                      action: {
                        type: Type.OBJECT,
                        properties: {
                          en: { type: Type.STRING },
                          hi: { type: Type.STRING },
                        },
                        required: ['en', 'hi'],
                      },
                      monthlyKwhSaved: { type: Type.NUMBER },
                      monthlyRupeesSaved: { type: Type.NUMBER },
                    },
                    required: [
                      'category',
                      'title',
                      'action',
                      'monthlyKwhSaved',
                      'monthlyRupeesSaved',
                    ],
                  },
                },
              },
              required: ['efficiencyScore', 'efficiencyExplanation', 'tips'],
            },
          },
        })
      );

      const rawText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawText) as {
        efficiencyScore?: number;
        efficiencyExplanation?: { en?: string; hi?: string };
        tips?: Array<{
          category?: string;
          title?: { en?: string; hi?: string };
          action?: { en?: string; hi?: string };
          monthlyKwhSaved?: number;
          monthlyRupeesSaved?: number;
        }>;
      };

      const validCategories = new Set(['cooling', 'appliances', 'lighting', 'standby', 'tariff']);
      const rawTips = Array.isArray(parsed.tips) ? parsed.tips.slice(0, 5) : [];

      if (rawTips.length === 0) {
        return res.status(502).json({
          code: 'EMPTY_TIPS',
          message: 'Could not generate personalized saving tips. Please try again.',
        });
      }

      const normalizedTips = rawTips.map((tip, idx) => {
        const kwhSaved = Math.max(
          2,
          Math.min(
            monthlyUnitsNormalized * 0.25,
            Number(tip.monthlyKwhSaved) || Math.max(4, monthlyUnitsNormalized * 0.05)
          )
        );
        const co2Saved = Number((kwhSaved * CO2_KG_PER_KWH).toFixed(1));
        const rupeesSaved = Math.max(
          15,
          Math.round(Number(tip.monthlyRupeesSaved) || kwhSaved * effectiveCostPerUnit)
        );
        const category = validCategories.has(String(tip.category))
          ? (tip.category as 'cooling' | 'appliances' | 'lighting' | 'standby' | 'tariff')
          : 'appliances';

        return {
          id: `tip-${idx + 1}`,
          category,
          title: {
            en: tip.title?.en?.trim() || 'Reduce peak appliance runtime',
            hi: tip.title?.hi?.trim() || 'पीक समय में उपकरणों का उपयोग कम करें',
          },
          action: {
            en: tip.action?.en?.trim() || 'Use timer settings and unplug idle chargers daily.',
            hi: tip.action?.hi?.trim() || 'टाइमर सेटिंग का उपयोग करें और खाली चार्जर बंद रखें।',
          },
          monthlyRupeesSaved: rupeesSaved,
          monthlyCo2SavedKg: co2Saved,
        };
      });

      const totalMonthlyRupeesSaved = normalizedTips.reduce(
        (sum, t) => sum + t.monthlyRupeesSaved,
        0
      );
      const totalMonthlyCo2SavedKg = Number(
        normalizedTips.reduce((sum, t) => sum + t.monthlyCo2SavedKg, 0).toFixed(1)
      );

      const finalScore = Math.max(
        5,
        Math.min(99, Math.round(Number(parsed.efficiencyScore) || baselineScore))
      );

      return res.json({
        bill: {
          unitsConsumed: units,
          totalAmountInr: amount,
          billingPeriod: periodStr,
          tariffRatePerUnit: effectiveCostPerUnit,
          billingDays: days,
          providerName: providerStr,
          consumerLocation: locationStr,
        },
        carbonFootprintKg,
        monthlyUnitsNormalized,
        indianAverageKwh: INDIAN_AVG_MONTHLY_KWH,
        efficiencyScore: finalScore,
        efficiencyExplanation: {
          en:
            parsed.efficiencyExplanation?.en?.trim() ||
            `Your normalized monthly usage is ${monthlyUnitsNormalized} kWh compared to the Indian household average of 90–100 kWh/month.`,
          hi:
            parsed.efficiencyExplanation?.hi?.trim() ||
            `आपकी मासिक खपत लगभग ${monthlyUnitsNormalized} यूनिट है, जबकि भारतीय घरेलू औसत 90–100 यूनिट/माह है।`,
        },
        tips: normalizedTips,
        totalMonthlyRupeesSaved,
        totalMonthlyCo2SavedKg,
      });
    } catch (error) {
      const formatted = formatGeminiError(error);
      return res.status(formatted.status).json({
        code: formatted.code,
        message: formatted.message,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WattWise server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
