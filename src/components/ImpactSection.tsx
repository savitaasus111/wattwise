import { Trees, Car, Flame } from 'lucide-react';
import { Language } from '../types/bill';
import { UI_COPY } from '../data/translations';
import { AnimatedNumber } from './AnimatedNumber';

interface ImpactSectionProps {
  language: Language;
  monthlyCo2SavedKg: number;
}

export function ImpactSection({ language, monthlyCo2SavedKg }: ImpactSectionProps) {
  const copy = UI_COPY[language].dashboard.impact;

  // Annual CO2 saved if the user follows the 5 personalized tips every month
  const annualCo2SavedKg = Number((monthlyCo2SavedKg * 12).toFixed(1));
  // 1 mature tree absorbs ~21.7 kg CO2/year
  const treesPerYear = Math.max(1, Math.round(annualCo2SavedKg / 21.7));
  // Average Indian petrol passenger car emits ~0.17 kg CO2/km
  const carKmAvoided = Math.max(10, Math.round(annualCo2SavedKg / 0.17));
  // ~0.45 kg of thermal coal per kg CO2 avoided
  const coalSavedKg = Math.max(5, Math.round(annualCo2SavedKg * 0.45));

  return (
    <section className="rounded-3xl border border-[#0D3B2E]/12 bg-gradient-to-br from-[#EDF7F1] via-white to-[#E6F4EE] p-6 sm:p-8 shadow-[0_6px_28px_-6px_rgba(13,59,46,0.09)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
        <div className="max-w-2xl">
          <h3 className="text-xl sm:text-2xl font-bold text-[#0D261F] tracking-tight">
            {copy.heading}
          </h3>
          <p className="mt-1.5 text-sm text-[#355449] leading-relaxed">{copy.subheading}</p>
        </div>

        <div className="rounded-2xl bg-[#0D3B2E] px-5 py-3.5 text-white shrink-0 shadow-sm">
          <span className="block text-xs text-[#A7F3D0]">{copy.annualCo2Label}</span>
          <span className="font-mono-tabular text-2xl font-bold">
            <AnimatedNumber value={annualCo2SavedKg} decimals={1} /> kg CO₂
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Trees Equivalent */}
        <div className="rounded-2xl border border-[#0D3B2E]/10 bg-white p-5 sm:p-6 shadow-[0_4px_18px_-4px_rgba(13,59,46,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-sm font-semibold text-[#0D261F]">{copy.treesTitle}</span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EE] text-[#059669]">
                <Trees className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono-tabular text-3xl sm:text-4xl font-bold text-[#0D3B2E]">
              <AnimatedNumber value={treesPerYear} />{' '}
              <span className="text-base font-medium text-[#4A635B]">{copy.treesUnit}</span>
            </p>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-[#4A635B] leading-relaxed">
            {copy.treesDesc}
          </p>
        </div>

        {/* Car Travel Avoided */}
        <div className="rounded-2xl border border-[#0D3B2E]/10 bg-white p-5 sm:p-6 shadow-[0_4px_18px_-4px_rgba(13,59,46,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-sm font-semibold text-[#0D261F]">{copy.carTitle}</span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EE] text-[#0D3B2E]">
                <Car className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono-tabular text-3xl sm:text-4xl font-bold text-[#0D3B2E]">
              <AnimatedNumber value={carKmAvoided} />{' '}
              <span className="text-base font-medium text-[#4A635B]">{copy.carUnit}</span>
            </p>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-[#4A635B] leading-relaxed">
            {copy.carDesc}
          </p>
        </div>

        {/* Thermal Coal Saved */}
        <div className="rounded-2xl border border-[#0D3B2E]/10 bg-white p-5 sm:p-6 shadow-[0_4px_18px_-4px_rgba(13,59,46,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <span className="text-sm font-semibold text-[#0D261F]">{copy.coalTitle}</span>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E6F4EE] text-[#0D3B2E]">
                <Flame className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono-tabular text-3xl sm:text-4xl font-bold text-[#0D3B2E]">
              <AnimatedNumber value={coalSavedKg} />{' '}
              <span className="text-base font-medium text-[#4A635B]">{copy.coalUnit}</span>
            </p>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-[#4A635B] leading-relaxed">
            {copy.coalDesc}
          </p>
        </div>
      </div>
    </section>
  );
}
