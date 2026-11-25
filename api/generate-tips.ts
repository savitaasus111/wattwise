import { Type } from '@google/genai';
import {
  ApiRequest,
  ApiResponse,
  CO2_KG_PER_KWH,
  INDIAN_AVG_MONTHLY_KWH,
  computeDeterministicScore,
  formatGeminiError,
  getGeminiClient,
  parseJsonBody,
  withRetry,
} from './_lib/gemini';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end?.();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader?.('Allow', 'POST');
    res.status(405).json({
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed. Use POST.',
    });
    return;
  }

  try {
    const {
      unitsConsumed,
      totalAmountInr,
      billingPeriod,
      tariffRatePerUnit,
      billingDays,
      providerName,
      consumerLocation,
    } = parseJsonBody<{
      unitsConsumed?: unknown;
      totalAmountInr?: unknown;
      billingPeriod?: unknown;
      tariffRatePerUnit?: unknown;
      billingDays?: unknown;
      providerName?: unknown;
      consumerLocation?: unknown;
    }>(req);

    const units = Number(unitsConsumed);
    const amount = Number(totalAmountInr);
    const rate = Number(tariffRatePerUnit) || (units > 0 ? amount / units : 7);
    const days =
      typeof billingDays === 'number' &&
      Number.isFinite(billingDays) &&
      billingDays >= 7 &&
      billingDays <= 120
        ? Math.round(billingDays)
        : 30;

    if (!Number.isFinite(units) || units <= 0 || units > 50000) {
      res.status(400).json({
        code: 'INVALID_UNITS',
        message: 'Please enter a valid positive number of units consumed (kWh).',
      });
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000) {
      res.status(400).json({
        code: 'INVALID_AMOUNT',
        message: 'Please enter a valid positive bill amount in rupees.',
      });
      return;
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
      res.status(502).json({
        code: 'EMPTY_TIPS',
        message: 'Could not generate personalized saving tips. Please try again.',
      });
      return;
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

    res.status(200).json({
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
    res.status(formatted.status).json({
      code: formatted.code,
      message: formatted.message,
    });
  }
}
