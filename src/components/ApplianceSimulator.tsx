import { useEffect, useMemo, useState } from 'react';
import {
  AirVent,
  Refrigerator,
  Fan,
  Droplets,
  Tv,
  Shirt,
  Lightbulb,
  Wifi,
  RotateCcw,
  Minus,
  Plus,
  Sparkles,
} from 'lucide-react';
import { ApplianceState, Language, ValidatedBillInput } from '../types/bill';
import { UI_COPY } from '../data/translations';

const CO2_KG_PER_KWH = 0.82;
const INDIAN_AVG_KWH = 95;

const DEFAULT_APPLIANCES: ApplianceState[] = [
  {
    id: 'ac',
    name: { en: 'Split AC (1.5 Ton)', hi: 'स्प्लिट AC (1.5 टन)' },
    wattageNote: { en: '1,450W avg compressor load', hi: '1,450W औसत कंप्रेसर लोड' },
    watts: 1450,
    quantity: 1,
    maxQuantity: 4,
    hoursPerDay: 5,
    maxHours: 16,
    stepHours: 0.5,
  },
  {
    id: 'fridge',
    name: { en: 'Refrigerator (Double Door)', hi: 'फ्रिज (डबल डोर)' },
    wattageNote: { en: '120W average continuous draw', hi: '120W औसत निरंतर खपत' },
    watts: 120,
    quantity: 1,
    maxQuantity: 2,
    hoursPerDay: 24,
    maxHours: 24,
    stepHours: 1,
  },
  {
    id: 'fan',
    name: { en: 'Ceiling Fan (Standard 75W)', hi: 'सीलिंग फैन (सामान्य 75W)' },
    wattageNote: { en: '75W per fan', hi: '75W प्रति पंखा' },
    watts: 75,
    quantity: 3,
    maxQuantity: 8,
    hoursPerDay: 10,
    maxHours: 24,
    stepHours: 1,
  },
  {
    id: 'geyser',
    name: { en: 'Water Heater / Geyser', hi: 'वॉटर हीटर / गीज़र' },
    wattageNote: { en: '2,000W heating element', hi: '2,000W हीटिंग एलिमेंट' },
    watts: 2000,
    quantity: 1,
    maxQuantity: 3,
    hoursPerDay: 0.5,
    maxHours: 4,
    stepHours: 0.5,
  },
  {
    id: 'tv',
    name: { en: 'LED Smart TV (43")', hi: 'LED स्मार्ट टीवी (43")' },
    wattageNote: { en: '90W screen + set-top box', hi: '90W स्क्रीन + सेट-टॉप बॉक्स' },
    watts: 90,
    quantity: 1,
    maxQuantity: 3,
    hoursPerDay: 4,
    maxHours: 16,
    stepHours: 0.5,
  },
  {
    id: 'washer',
    name: { en: 'Washing Machine', hi: 'वॉशिंग मशीन' },
    wattageNote: { en: '500W avg wash/spin cycle', hi: '500W औसत धुलाई चक्र' },
    watts: 500,
    quantity: 1,
    maxQuantity: 2,
    hoursPerDay: 0.5,
    maxHours: 4,
    stepHours: 0.5,
  },
  {
    id: 'lights',
    name: { en: 'LED Tube & Bulbs (Set)', hi: 'LED ट्यूब और बल्ब (सेट)' },
    wattageNote: { en: '20W per room fixture', hi: '20W प्रति कमरा लाइट' },
    watts: 20,
    quantity: 5,
    maxQuantity: 15,
    hoursPerDay: 6,
    maxHours: 16,
    stepHours: 0.5,
  },
  {
    id: 'router',
    name: { en: 'Wi-Fi Router & Laptops', hi: 'वाई-फाई राउटर व लैपटॉप' },
    wattageNote: { en: '45W combined setup', hi: '45W संयुक्त खपत' },
    watts: 45,
    quantity: 1,
    maxQuantity: 4,
    hoursPerDay: 8,
    maxHours: 24,
    stepHours: 1,
  },
];

const APPLIANCE_ICONS: Record<string, typeof Fan> = {
  ac: AirVent,
  fridge: Refrigerator,
  fan: Fan,
  geyser: Droplets,
  tv: Tv,
  washer: Shirt,
  lights: Lightbulb,
  router: Wifi,
};

interface ApplianceSimulatorProps {
  language: Language;
  defaultTariffRate?: number;
  isGeneratingTips?: boolean;
  onGenerateAiTips: (simulatedBill: ValidatedBillInput) => void;
}

export function ApplianceSimulator({
  language,
  defaultTariffRate = 7.5,
  isGeneratingTips = false,
  onGenerateAiTips,
}: ApplianceSimulatorProps) {
  const copy = UI_COPY[language].simulator;
  const [appliances, setAppliances] = useState<ApplianceState[]>(DEFAULT_APPLIANCES);
  const [tariffRate, setTariffRate] = useState<number>(
    Number.isFinite(defaultTariffRate) && defaultTariffRate > 0 ? defaultTariffRate : 7.5
  );
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (Number.isFinite(defaultTariffRate) && defaultTariffRate > 0) {
      setTariffRate(defaultTariffRate);
    }
  }, [defaultTariffRate]);

  const updateAppliance = (id: string, patch: Partial<ApplianceState>) => {
    setWarning(null);
    setAppliances((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleReset = () => {
    setWarning(null);
    setAppliances(DEFAULT_APPLIANCES);
    setTariffRate(defaultTariffRate > 0 ? defaultTariffRate : 7.5);
  };

  const breakdown = useMemo(() => {
    const items = appliances.map((item) => {
      // Monthly kWh = (watts * quantity * hoursPerDay * 30 days) / 1000
      const monthlyKwh = Number(
        ((item.watts * item.quantity * item.hoursPerDay * 30) / 1000).toFixed(1)
      );
      const monthlyRupees = Math.round(monthlyKwh * tariffRate);
      const monthlyCo2Kg = Number((monthlyKwh * CO2_KG_PER_KWH).toFixed(1));
      return {
        ...item,
        monthlyKwh,
        monthlyRupees,
        monthlyCo2Kg,
      };
    });

    const totalKwh = Number(
      items.reduce((acc, item) => acc + item.monthlyKwh, 0).toFixed(1)
    );
    const totalRupees = Math.round(totalKwh * tariffRate);
    const totalCo2Kg = Number((totalKwh * CO2_KG_PER_KWH).toFixed(1));

    const sortedActive = [...items]
      .filter((i) => i.monthlyKwh > 0)
      .sort((a, b) => b.monthlyKwh - a.monthlyKwh);

    return { items, sortedActive, totalKwh, totalRupees, totalCo2Kg };
  }, [appliances, tariffRate]);

  const diffPct = Math.round(
    ((breakdown.totalKwh - INDIAN_AVG_KWH) / INDIAN_AVG_KWH) * 100
  );

  const handleAnalyzeSimulation = () => {
    if (breakdown.totalKwh <= 0 || breakdown.totalRupees <= 0) {
      setWarning(copy.zeroWarning);
      return;
    }

    onGenerateAiTips({
      unitsConsumed: breakdown.totalKwh,
      totalAmountInr: breakdown.totalRupees,
      billingPeriod:
        language === 'hi' ? 'अनुमानित मासिक सिमुलेशन' : 'Simulated 30-Day Home Profile',
      tariffRatePerUnit: Number(tariffRate.toFixed(2)),
      billingDays: 30,
      providerName: language === 'hi' ? 'उपकरण सिम्युलेटर अनुमान' : 'Appliance Simulator',
      consumerLocation: 'India',
    });
  };

  return (
    <section
      id="simulator"
      className="mx-auto max-w-6xl px-4 sm:px-6 py-14 md:py-20 border-t border-[#0D3B2E]/10 scroll-mt-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
        <div className="max-w-2xl">
          <p className="text-xs sm:text-sm font-semibold text-[#059669] mb-1.5">
            {copy.kicker}
          </p>
          <h2
            className="text-2xl sm:text-3xl font-bold text-[#0D261F] tracking-tight"
            style={{ textWrap: 'balance' }}
          >
            {copy.heading}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#4A635B] leading-relaxed">
            {copy.subheading}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2.5 rounded-xl border border-[#0D3B2E]/15 bg-white px-3.5 py-2 shadow-xs">
            <label
              htmlFor="sim-tariff"
              className="text-xs font-medium text-[#2D473F] whitespace-nowrap"
            >
              {copy.tariffLabel}
            </label>
            <input
              id="sim-tariff"
              type="number"
              min="1"
              max="25"
              step="0.25"
              value={tariffRate}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (Number.isFinite(v) && v >= 0.5 && v <= 30) {
                  setTariffRate(v);
                }
              }}
              className="w-16 rounded-lg border border-[#0D3B2E]/15 bg-[#F6FAF7] px-2 py-1 text-right font-mono-tabular text-sm font-semibold text-[#0D261F] outline-none focus:border-[#0D3B2E]"
            />
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#0D3B2E]/15 bg-white px-4 py-2.5 text-xs sm:text-sm font-medium text-[#0D261F] hover:bg-[#E6F4EE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{copy.resetBtn}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Appliances Controls (Left) + Live Cost & CO2 Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Appliance Selector Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {breakdown.items.map((item) => {
            const Icon = APPLIANCE_ICONS[item.id] || Lightbulb;
            const isActive = item.quantity > 0 && item.hoursPerDay > 0;
            const sharePct =
              breakdown.totalKwh > 0
                ? Math.round((item.monthlyKwh / breakdown.totalKwh) * 100)
                : 0;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                  isActive
                    ? 'border-[#0D3B2E]/15 bg-white shadow-[0_4px_20px_-4px_rgba(13,59,46,0.08)]'
                    : 'border-[#0D3B2E]/8 bg-[#F6FAF7]/70 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        isActive
                          ? 'bg-[#E6F4EE] text-[#0D3B2E]'
                          : 'bg-[#E2ECE6] text-[#5B746C]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#0D261F] leading-snug">
                        {item.name[language]}
                      </h3>
                      <p className="text-xs text-[#4A635B] mt-0.5">
                        {item.wattageNote[language]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center justify-between gap-2 py-2.5 border-y border-[#0D3B2E]/8">
                  <span className="text-xs font-medium text-[#2D473F]">{copy.qtyLabel}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.name[language]}`}
                      onClick={() =>
                        updateAppliance(item.id, {
                          quantity: Math.max(0, item.quantity - 1),
                        })
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#0D3B2E]/15 bg-[#F6FAF7] text-[#0D261F] hover:bg-[#E6F4EE] transition-colors cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center font-mono-tabular text-sm font-bold text-[#0D261F]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.name[language]}`}
                      onClick={() =>
                        updateAppliance(item.id, {
                          quantity: Math.min(item.maxQuantity, item.quantity + 1),
                        })
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#0D3B2E]/15 bg-[#F6FAF7] text-[#0D261F] hover:bg-[#E6F4EE] transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Daily Hours Slider */}
                <div className="pt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label htmlFor={`hrs-${item.id}`} className="font-medium text-[#2D473F]">
                      {copy.hoursLabel}
                    </label>
                    <span className="font-mono-tabular font-semibold text-[#0D3B2E]">
                      {item.hoursPerDay} {copy.hrsPerDayUnit}
                    </span>
                  </div>
                  <input
                    id={`hrs-${item.id}`}
                    type="range"
                    min={0}
                    max={item.maxHours}
                    step={item.stepHours}
                    disabled={item.quantity === 0}
                    value={item.hoursPerDay}
                    onChange={(e) =>
                      updateAppliance(item.id, {
                        hoursPerDay: parseFloat(e.target.value),
                      })
                    }
                    className="w-full h-2 rounded-lg appearance-none bg-[#DCECE3] accent-[#0D3B2E] cursor-pointer disabled:opacity-40"
                  />
                </div>

                {/* Appliance Live Totals */}
                <div className="mt-3 pt-2.5 border-t border-[#0D3B2E]/8 flex items-center justify-between text-xs">
                  <span className="font-mono-tabular font-semibold text-[#0D261F]">
                    {item.monthlyKwh} kWh · ₹{item.monthlyRupees.toLocaleString('en-IN')}
                  </span>
                  <span className="font-mono-tabular text-[#059669] font-medium">
                    {item.monthlyCo2Kg} kg CO₂ ({sharePct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Sticky Live Monthly Summary & Contribution Breakdown */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 rounded-3xl bg-[#0D3B2E] text-white p-6 sm:p-7 shadow-[0_12px_36px_-8px_rgba(13,59,46,0.28)] space-y-6">
          <div>
            <p className="text-xs font-medium text-[#A7F3D0]">{copy.summaryTitle}</p>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 pb-5 border-b border-white/15">
              <div>
                <p className="text-xs text-[#D1FAE5]">{copy.estMonthlyBill}</p>
                <p className="font-mono-tabular text-3xl sm:text-4xl font-bold mt-1">
                  ₹{breakdown.totalRupees.toLocaleString('en-IN')}
                </p>
                <p className="font-mono-tabular text-xs text-[#A7F3D0] mt-1">
                  {breakdown.totalKwh} kWh / {copy.monthUnit}
                </p>
              </div>

              <div>
                <p className="text-xs text-[#D1FAE5]">{copy.estCarbon}</p>
                <p className="font-mono-tabular text-3xl sm:text-4xl font-bold text-[#A7F3D0] mt-1">
                  {breakdown.totalCo2Kg}{' '}
                  <span className="text-base font-medium">kg</span>
                </p>
                <p className="text-xs text-[#D1FAE5] mt-1">
                  {diffPct >= 0
                    ? `+${diffPct}% ${copy.aboveAvgShort}`
                    : `${Math.abs(diffPct)}% ${copy.belowAvgShort}`}{' '}
                  ({copy.vsAvgLabel})
                </p>
              </div>
            </div>
          </div>

          {/* Appliance Share Bars */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[#D1FAE5]">{copy.breakdownHeading}</p>

            {breakdown.sortedActive.length === 0 ? (
              <p className="text-sm text-[#A7F3D0]/80 py-4">{copy.zeroWarning}</p>
            ) : (
              <div className="space-y-3">
                {breakdown.sortedActive.slice(0, 5).map((item) => {
                  const pct =
                    breakdown.totalKwh > 0
                      ? Math.round((item.monthlyKwh / breakdown.totalKwh) * 100)
                      : 0;
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-white font-medium truncate">
                          {item.name[language]}
                        </span>
                        <span className="font-mono-tabular text-[#A7F3D0] shrink-0">
                          ₹{item.monthlyRupees.toLocaleString('en-IN')} · {pct}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/15 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#34D399] transition-all duration-300"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {warning && (
            <p className="rounded-xl bg-amber-500/20 border border-amber-300/30 px-3.5 py-2.5 text-xs text-amber-100">
              {warning}
            </p>
          )}

          <button
            type="button"
            disabled={isGeneratingTips}
            onClick={handleAnalyzeSimulation}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#A7F3D0] px-5 py-3.5 text-sm font-bold text-[#06241B] hover:bg-[#6EE7B7] disabled:opacity-60 transition-colors cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isGeneratingTips ? copy.analyzingCta : copy.analyzeCta}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
