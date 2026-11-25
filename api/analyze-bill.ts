import { Type } from '@google/genai';
import {
  ALLOWED_MIME_TYPES,
  ApiRequest,
  ApiResponse,
  MAX_BASE64_BYTES,
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
    const { fileData, mimeType } = parseJsonBody<{
      fileData?: unknown;
      mimeType?: unknown;
    }>(req);

    if (typeof fileData !== 'string' || fileData.length < 16) {
      res.status(400).json({
        code: 'INVALID_FILE',
        message: 'Please upload a valid electricity bill image or PDF file.',
      });
      return;
    }

    if (fileData.length > MAX_BASE64_BYTES) {
      res.status(413).json({
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds 10 MB. Please upload a smaller image or compressed PDF.',
      });
      return;
    }

    const normalizedMime =
      typeof mimeType === 'string' ? mimeType.toLowerCase().trim() : '';
    if (!ALLOWED_MIME_TYPES.has(normalizedMime)) {
      res.status(400).json({
        code: 'UNSUPPORTED_FORMAT',
        message: 'Unsupported file type. Please upload a JPG, PNG, WebP image, or PDF bill.',
      });
      return;
    }

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
            required: ['isElectricityBill', 'billingDays', 'missingFields', 'extractionNote'],
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

    const allowedMissing = [
      'unitsConsumed',
      'totalAmountInr',
      'billingPeriod',
      'tariffRatePerUnit',
    ];
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

    res.status(200).json({
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
    res.status(formatted.status).json({
      code: formatted.code,
      message: formatted.message,
    });
  }
}
