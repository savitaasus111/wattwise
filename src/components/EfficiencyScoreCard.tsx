import { motion } from 'motion/react';
import { Language } from '../types/bill';
import { UI_COPY } from '../data/translations';

interface EfficiencyScoreCardProps {
  language: Language;
  score: number;
  explanation: string;
}

export function EfficiencyScoreCard({
  language,
  score,
  explanation,
}: EfficiencyScoreCardProps) {
  const copy = UI_COPY[language].dashboard.score;

  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let bandLabel = copy.bands.moderate;
  let strokeColor = '#D97706';
  let textColor = 'text-amber-700';

  if (clampedScore >= 80) {
    bandLabel = copy.bands.excellent;
    strokeColor = '#059669';
    textColor = 'text-[#059669]';
  } else if (clampedScore >= 60) {
    bandLabel = copy.bands.good;
    strokeColor = '#0D3B2E';
    textColor = 'text-[#0D3B2E]';
  } else if (clampedScore < 45) {
    bandLabel = copy.bands.high;
    strokeColor = '#DC2626';
    textColor = 'text-red-700';
  }

  return (
    <div className="rounded-3xl border border-[#0D3B2E]/12 bg-white p-5 sm:p-7 shadow-[0_6px_26px_-6px_rgba(13,59,46,0.08)] flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <h3 className="text-lg sm:text-xl font-semibold text-[#0D261F]">{copy.title}</h3>
          <span className={`text-xs font-semibold ${textColor}`}>{bandLabel}</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative h-32 w-32 shrink-0 flex items-center justify-center">
            <svg className="h-32 w-32 -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="#E6F4EE"
                strokeWidth="10"
              />
              <motion.circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke={strokeColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono-tabular text-3xl font-bold text-[#0D261F] leading-none">
                {clampedScore}
              </span>
              <span className="text-xs text-[#4A635B] mt-1">{copy.outOf}</span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[#2D473F]">{explanation}</p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[#0D3B2E]/8 flex items-center justify-between gap-2 text-xs text-[#4A635B]">
        <span>{copy.highLoadHint}</span>
        <span>{copy.lowLoadHint}</span>
      </div>
    </div>
  );
}
