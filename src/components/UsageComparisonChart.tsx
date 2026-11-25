import { motion } from 'motion/react';
import { Language } from '../types/bill';
import { UI_COPY } from '../data/translations';

interface UsageComparisonChartProps {
  language: Language;
  userMonthlyKwh: number;
  indianAvgKwh: number;
  billingDays: number;
}

export function UsageComparisonChart({
  language,
  userMonthlyKwh,
  indianAvgKwh,
  billingDays,
}: UsageComparisonChartProps) {
  const copy = UI_COPY[language].dashboard.comparison;

  const maxScale = Math.max(userMonthlyKwh, indianAvgKwh, 120) * 1.15;
  const userWidthPct = Math.max(8, Math.min(100, (userMonthlyKwh / maxScale) * 100));
  const avgWidthPct = Math.max(8, Math.min(100, (indianAvgKwh / maxScale) * 100));
  const bandStartPct = (90 / maxScale) * 100;
  const bandWidthPct = (10 / maxScale) * 100;

  const diffPct = Math.round(((userMonthlyKwh - indianAvgKwh) / indianAvgKwh) * 100);
  const absDiff = Math.abs(diffPct);

  let comparisonSummary = copy.atAvg;
  if (diffPct > 5) {
    comparisonSummary = `${absDiff}% ${copy.aboveAvg}`;
  } else if (diffPct < -5) {
    comparisonSummary = `${absDiff}% ${copy.belowAvg}`;
  }

  const isHigher = diffPct > 10;

  return (
    <div className="rounded-3xl border border-[#0D3B2E]/12 bg-white p-5 sm:p-7 shadow-[0_6px_26px_-6px_rgba(13,59,46,0.08)] flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
          <h3 className="text-lg sm:text-xl font-semibold text-[#0D261F]">{copy.title}</h3>
          <span
            className={`font-mono-tabular text-xs font-semibold ${
              isHigher ? 'text-amber-700' : 'text-[#059669]'
            }`}
          >
            {comparisonSummary}
          </span>
        </div>
        <p className="text-sm text-[#4A635B] mb-6">{copy.subtitle}</p>

        {/* Clearly Labeled Bar Chart */}
        <div className="relative space-y-6 py-2">
          {/* Bar 1: Your Household */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#0D3B2E] inline-block shrink-0" />
                <span className="font-semibold text-[#0D261F]">{copy.yourHome}</span>
              </div>
              <span className="font-mono-tabular font-bold text-[#0D261F]">
                {userMonthlyKwh} kWh / {copy.monthShort}
              </span>
            </div>
            <div className="relative h-12 w-full rounded-xl bg-[#EEF5F0] overflow-hidden">
              <div
                className="absolute top-0 bottom-0 bg-[#0D3B2E]/10 border-x border-dashed border-[#0D3B2E]/35 z-10 pointer-events-none"
                style={{ left: `${bandStartPct}%`, width: `${Math.max(bandWidthPct, 2)}%` }}
                title={copy.avgRangeNote}
              />
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: `${userWidthPct}%`, transformOrigin: 'left' }}
                className={`h-full rounded-xl flex items-center px-3 ${
                  isHigher
                    ? 'bg-gradient-to-r from-[#0D3B2E] to-[#D97706]'
                    : 'bg-gradient-to-r from-[#0D3B2E] to-[#059669]'
                }`}
              >
                {userWidthPct >= 26 && (
                  <span className="font-mono-tabular text-xs font-semibold text-white whitespace-nowrap">
                    {userMonthlyKwh} kWh
                  </span>
                )}
              </motion.div>
            </div>
          </div>

          {/* Bar 2: Average Indian Household */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#6EA88F] inline-block shrink-0" />
                <span className="font-medium text-[#2D473F]">{copy.indianAvg}</span>
              </div>
              <span className="font-mono-tabular font-semibold text-[#4A635B]">
                90–100 kWh / {copy.monthShort}
              </span>
            </div>
            <div className="relative h-12 w-full rounded-xl bg-[#EEF5F0] overflow-hidden">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: `${avgWidthPct}%`, transformOrigin: 'left' }}
                className="h-full rounded-xl bg-[#6EA88F] flex items-center px-3"
              >
                {avgWidthPct >= 24 && (
                  <span className="font-mono-tabular text-xs font-semibold text-white whitespace-nowrap">
                    ~95 kWh
                  </span>
                )}
              </motion.div>
            </div>
          </div>

          {/* Axis Scale */}
          <div className="flex justify-between pt-2 border-t border-[#0D3B2E]/10 font-mono-tabular text-xs text-[#4A635B]">
            <span>0 kWh</span>
            <span>{Math.round(maxScale / 2)} kWh</span>
            <span>{Math.round(maxScale)} kWh</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-[#0D3B2E]/8 flex flex-wrap items-center justify-between gap-2 text-xs text-[#4A635B]">
        <span>{copy.avgRangeNote}</span>
        {billingDays !== 30 && <span>{copy.monthlyEquivalentNote}</span>}
      </div>
    </div>
  );
}
