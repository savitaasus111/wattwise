import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Share2,
  Pencil,
  Upload,
  Zap,
  IndianRupee,
  Leaf,
  Gauge,
  ThermometerSnowflake,
  Lightbulb,
  PowerOff,
  Clock,
  Cpu,
} from 'lucide-react';
import { AnalysisResult, Language, TipCategory } from '../types/bill';
import { UI_COPY } from '../data/translations';
import { DEMO_BILLS } from '../data/demoBills';
import { UsageComparisonChart } from './UsageComparisonChart';
import { EfficiencyScoreCard } from './EfficiencyScoreCard';
import { ShareResultModal } from './ShareResultModal';
import { AnimatedNumber } from './AnimatedNumber';
import { ImpactSection } from './ImpactSection';

interface ResultsDashboardProps {
  language: Language;
  result: AnalysisResult;
  activeDemoId: string | null;
  onSelectDemo: (demoId: string) => void;
  onEditValues: () => void;
  onUploadAnother: () => void;
}

const CATEGORY_ICONS: Record<TipCategory, typeof Lightbulb> = {
  cooling: ThermometerSnowflake,
  appliances: Cpu,
  lighting: Lightbulb,
  standby: PowerOff,
  tariff: Clock,
};

export function ResultsDashboard({
  language,
  result,
  activeDemoId,
  onSelectDemo,
  onEditValues,
  onUploadAnother,
}: ResultsDashboardProps) {
  const copy = UI_COPY[language].dashboard;
  const [isShareOpen, setIsShareOpen] = useState(false);

  const treesEquivalent = Math.max(1, Math.round(result.carbonFootprintKg / 1.8));
  const annualSavings = result.totalMonthlyRupeesSaved * 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* Demo Preset Switcher */}
      {result.isDemo && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#0D3B2E]/12 bg-[#E6F4EE]/80 px-4 py-3.5 shadow-xs">
          <span className="text-xs font-semibold text-[#0D3B2E]">{copy.demoBar.label}</span>
          <div className="flex flex-wrap items-center gap-2">
            {DEMO_BILLS.map((preset) => {
              const active = activeDemoId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onSelectDemo(preset.id)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0D3B2E] text-white shadow-xs'
                      : 'bg-white text-[#0D261F] hover:bg-[#D5ECE0]'
                  }`}
                >
                  {preset.name[language]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Report Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#0D3B2E]/10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#4A635B]">
            <span className="font-semibold text-[#0D3B2E]">{copy.headerKicker}</span>
            <span aria-hidden="true">·</span>
            <span>{result.bill.providerName}</span>
            <span aria-hidden="true">·</span>
            <span>{result.bill.billingPeriod}</span>
            {result.isDemo && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#059669]">{copy.demoNotice}</span>
              </>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0D261F] mt-1.5 tracking-tight">
            {result.bill.consumerLocation !== 'India'
              ? `${result.bill.consumerLocation} · ${result.bill.billingPeriod}`
              : result.bill.billingPeriod}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onEditValues}
            className="inline-flex items-center gap-2 rounded-xl border border-[#0D3B2E]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#0D261F] hover:bg-[#E6F4EE] transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            <Pencil className="h-4 w-4 text-[#0D3B2E]" />
            <span>{copy.editValues}</span>
          </button>

          <button
            type="button"
            onClick={onUploadAnother}
            className="inline-flex items-center gap-2 rounded-xl border border-[#0D3B2E]/15 bg-white px-4 py-2.5 text-sm font-medium text-[#0D261F] hover:bg-[#E6F4EE] transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            <Upload className="h-4 w-4 text-[#0D3B2E]" />
            <span>{copy.uploadAnother}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0D3B2E] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#134E3A] transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
          >
            <Share2 className="h-4 w-4" />
            <span>{copy.shareResult}</span>
          </button>
        </div>
      </div>

      {/* Large Animated CO2 Spotlight */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0D3B2E] via-[#114839] to-[#0A2E23] p-6 sm:p-8 text-white shadow-[0_14px_38px_-10px_rgba(13,59,46,0.35)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#A7F3D0]">
            <Leaf className="h-4 w-4" />
            <span>{copy.co2SpotlightLabel}</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-mono-tabular text-4xl sm:text-6xl font-bold tracking-tight text-white">
              <AnimatedNumber
                key={`co2-${result.carbonFootprintKg}-${result.bill.unitsConsumed}`}
                value={result.carbonFootprintKg}
                decimals={1}
              />
            </span>
            <span className="text-xl sm:text-2xl font-semibold text-[#A7F3D0]">
              {copy.co2PerMonthUnit}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#D1FAE5]/90">{copy.co2SpotlightSub}</p>
        </div>

        <div className="rounded-2xl bg-white/10 border border-white/15 px-5 py-4 shrink-0 md:text-right">
          <span className="block text-xs text-[#A7F3D0]">{copy.summary.treesEquivalent}</span>
          <span className="font-mono-tabular text-2xl sm:text-3xl font-bold text-white mt-1 block">
            ~<AnimatedNumber value={treesEquivalent} />{' '}
            <span className="text-sm font-normal text-[#D1FAE5]">
              {language === 'hi' ? 'पेड़' : 'trees'}
            </span>
          </span>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="rounded-2xl border border-[#0D3B2E]/10 bg-white p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(13,59,46,0.07)]">
          <div className="flex items-center justify-between text-xs font-medium text-[#4A635B]">
            <span>{copy.summary.unitsUsed}</span>
            <Zap className="h-4 w-4 text-[#0D3B2E]" />
          </div>
          <p className="font-mono-tabular text-3xl font-bold text-[#0D261F] mt-2.5">
            {result.bill.unitsConsumed} <span className="text-lg font-medium">kWh</span>
          </p>
          <p className="text-xs text-[#4A635B] mt-1.5">
            {copy.summary.unitsSub} · {result.bill.billingDays}{' '}
            {language === 'hi' ? 'दिन' : 'days'}
          </p>
        </div>

        <div className="rounded-2xl border border-[#0D3B2E]/10 bg-white p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(13,59,46,0.07)]">
          <div className="flex items-center justify-between text-xs font-medium text-[#4A635B]">
            <span>{copy.summary.amountPaid}</span>
            <IndianRupee className="h-4 w-4 text-[#0D3B2E]" />
          </div>
          <p className="font-mono-tabular text-3xl font-bold text-[#0D261F] mt-2.5">
            ₹{result.bill.totalAmountInr.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-[#4A635B] mt-1.5">{copy.summary.amountSub}</p>
        </div>

        <div className="rounded-2xl border border-[#0D3B2E]/10 bg-white p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(13,59,46,0.07)]">
          <div className="flex items-center justify-between text-xs font-medium text-[#4A635B]">
            <span>{copy.summary.costPerUnit}</span>
            <Gauge className="h-4 w-4 text-[#0D3B2E]" />
          </div>
          <p className="font-mono-tabular text-3xl font-bold text-[#0D261F] mt-2.5">
            ₹{result.bill.tariffRatePerUnit.toFixed(2)}
          </p>
          <p className="text-xs text-[#4A635B] mt-1.5">{copy.summary.costPerUnitSub}</p>
        </div>

        <div className="rounded-2xl border border-[#0D3B2E]/10 bg-[#E6F4EE]/80 p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(13,59,46,0.07)]">
          <div className="flex items-center justify-between text-xs font-medium text-[#0D3B2E]">
            <span>{copy.summary.carbonFootprint}</span>
            <Leaf className="h-4 w-4 text-[#059669]" />
          </div>
          <p className="font-mono-tabular text-3xl font-bold text-[#0D261F] mt-2.5">
            {result.carbonFootprintKg} <span className="text-lg font-medium">kg CO₂</span>
          </p>
          <p className="text-xs text-[#2D473F] mt-1.5">{copy.summary.carbonSub}</p>
        </div>
      </div>

      {/* Bar Chart Comparison & Efficiency Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7">
          <UsageComparisonChart
            language={language}
            userMonthlyKwh={result.monthlyUnitsNormalized}
            indianAvgKwh={result.indianAverageKwh}
            billingDays={result.bill.billingDays}
          />
        </div>
        <div className="lg:col-span-5">
          <EfficiencyScoreCard
            language={language}
            score={result.efficiencyScore}
            explanation={result.efficiencyExplanation[language]}
          />
        </div>
      </div>

      {/* 5 Personalized Saving Tips */}
      <section id="tips-section" className="pt-4 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0D261F] tracking-tight">
              {copy.tipsSection.heading}
            </h3>
            <p className="text-sm sm:text-base text-[#4A635B] mt-1">
              {copy.tipsSection.subheading}
            </p>
          </div>
        </div>

        {/* Prominent "Total potential savings: Rs X per month" Banner */}
        <div className="rounded-3xl bg-[#0D3B2E] p-6 sm:p-8 text-white shadow-[0_12px_32px_-8px_rgba(13,59,46,0.28)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-[#A7F3D0]">
              {copy.tipsSection.totalPotentialPrefix}{' '}
              <span className="font-mono-tabular font-bold text-white">
                {language === 'en' ? 'Rs' : '₹'}{' '}
                {result.totalMonthlyRupeesSaved.toLocaleString('en-IN')}{' '}
                {copy.tipsSection.perMonthLabel}
              </span>
            </p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="font-mono-tabular text-3xl sm:text-4xl font-bold text-white">
                ₹<AnimatedNumber value={result.totalMonthlyRupeesSaved} />{' '}
                <span className="text-lg font-normal text-[#D1FAE5]">
                  / {copy.comparison.monthShort}
                </span>
              </span>
              <span className="text-[#A7F3D0]" aria-hidden="true">
                ·
              </span>
              <span className="font-mono-tabular text-lg sm:text-xl font-semibold text-[#A7F3D0]">
                -{result.totalMonthlyCo2SavedKg} {copy.tipsSection.co2PerMonth}
              </span>
            </div>
          </div>

          <div className="border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-6 shrink-0">
            <p className="text-xs text-[#D1FAE5]">{copy.tipsSection.annualProjection}</p>
            <p className="font-mono-tabular text-2xl font-bold text-white mt-0.5">
              ₹{annualSavings.toLocaleString('en-IN')} / {copy.tipsSection.yearShort}
            </p>
          </div>
        </div>

        {/* 5 Tips List */}
        <div className="grid grid-cols-1 gap-3.5">
          {result.tips.map((tip, index) => {
            const Icon = CATEGORY_ICONS[tip.category] || Lightbulb;
            return (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-2xl border border-[#0D3B2E]/10 bg-white p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(13,59,46,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#0D3B2E]/25 transition-colors"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EE] text-[#0D3B2E]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A635B]">
                      <span className="font-mono-tabular font-semibold text-[#0D3B2E]">
                        0{index + 1}.
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{copy.tipsSection.categories[tip.category]}</span>
                    </div>
                    <h4 className="text-base font-semibold text-[#0D261F]">
                      {tip.title[language]}
                    </h4>
                    <p className="text-sm text-[#4A635B] leading-relaxed">
                      {tip.action[language]}
                    </p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-baseline md:items-end justify-between md:justify-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-[#0D3B2E]/8 shrink-0 md:min-w-[155px]">
                  <div className="md:text-right">
                    <span className="block text-xs text-[#4A635B]">
                      {copy.tipsSection.savePerMonth}
                    </span>
                    <span className="font-mono-tabular text-lg font-bold text-[#0D3B2E]">
                      ₹{tip.monthlyRupeesSaved.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono-tabular text-xs font-semibold text-[#059669]">
                      -{tip.monthlyCo2SavedKg} kg CO₂
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Real-World CO2 Impact Equivalents Section */}
      <ImpactSection
        language={language}
        monthlyCo2SavedKg={result.totalMonthlyCo2SavedKg}
      />

      <ShareResultModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        result={result}
        language={language}
      />
    </motion.div>
  );
}
