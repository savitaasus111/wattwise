import { GoogleGenAI } from '@google/genai';

export const CO2_KG_PER_KWH = 0.82;
export const INDIAN_AVG_MONTHLY_KWH = 95;
export const MAX_BASE64_BYTES = 14 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
]);

export interface ApiRequest {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

export interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader?: (name: string, value: string) => void;
  end?: (chunk?: string) => void;
}

export function parseJsonBody<T extends Record<string, unknown>>(req: ApiRequest): T {
  const raw = req.body;
  if (!raw) return {} as T;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return {} as T;
    }
  }
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(raw)) {
    try {
      return JSON.parse(raw.toString('utf8')) as T;
    } catch {
      return {} as T;
    }
  }
  if (typeof raw === 'object') {
    return raw as T;
  }
  return {} as T;
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const err = new Error(
      'GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY in your environment variables.'
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

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
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

export function formatGeminiError(error: unknown): {
  status: number;
  message: string;
  code: string;
} {
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
        'Your Gemini API key appears invalid or lacks permission. Please verify GEMINI_API_KEY in your environment settings.',
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

export function computeDeterministicScore(monthlyKwh: number): number {
  if (monthlyKwh <= 60) return 96;
  if (monthlyKwh <= 95) {
    return Math.round(95 - ((monthlyKwh - 60) / 35) * 13);
  }
  if (monthlyKwh <= 200) {
    return Math.round(82 - ((monthlyKwh - 95) / 105) * 24);
  }
  if (monthlyKwh <= 400) {
    return Math.round(58 - ((monthlyKwh - 200) / 200) * 28);
  }
  return Math.max(12, Math.round(30 - ((monthlyKwh - 400) / 300) * 18));
}
