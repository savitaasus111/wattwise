import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import {
  BillExtractionResponse,
  EditableField,
  Language,
  ValidatedBillInput,
} from '../types/bill';
import { UI_COPY } from '../data/translations';

interface BillReviewFormProps {
  language: Language;
  extraction: BillExtractionResponse | null;
  initialValues?: Partial<ValidatedBillInput>;
  isSubmitting: boolean;
  onConfirm: (validated: ValidatedBillInput) => void;
  onResetUpload: () => void;
}

export function BillReviewForm({
  language,
  extraction,
  initialValues,
  isSubmitting,
  onConfirm,
  onResetUpload,
}: BillReviewFormProps) {
  const copy = UI_COPY[language].review;

  const [units, setUnits] = useState<string>(() => {
    const val = initialValues?.unitsConsumed ?? extraction?.unitsConsumed;
    return val !== null && val !== undefined ? String(val) : '';
  });
  const [amount, setAmount] = useState<string>(() => {
    const val = initialValues?.totalAmountInr ?? extraction?.totalAmountInr;
    return val !== null && val !== undefined ? String(val) : '';
  });
  const [period, setPeriod] = useState<string>(() => {
    return initialValues?.billingPeriod ?? extraction?.billingPeriod ?? '';
  });
  const [tariff, setTariff] = useState<string>(() => {
    const val = initialValues?.tariffRatePerUnit ?? extraction?.tariffRatePerUnit;
    return val !== null && val !== undefined ? String(val) : '';
  });
  const [billingDays, setBillingDays] = useState<string>(() => {
    return String(initialValues?.billingDays ?? extraction?.billingDays ?? 30);
  });
  const [providerName, setProviderName] = useState<string>(() => {
    return initialValues?.providerName ?? extraction?.providerName ?? '';
  });
  const [formError, setFormError] = useState<string | null>(null);

  const missingSet = new Set<EditableField>(extraction?.missingFields ?? []);
  const hasMissing = missingSet.size > 0;
  const isUnreadable = extraction ? !extraction.isElectricityBill : false;

  const handleUnitsOrAmountBlur = () => {
    const u = parseFloat(units);
    const a = parseFloat(amount);
    if (!tariff && Number.isFinite(u) && u > 0 && Number.isFinite(a) && a > 0) {
      setTariff((a / u).toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedUnits = parseFloat(units);
    const parsedAmount = parseFloat(amount);
    const parsedDays = parseInt(billingDays, 10);

    if (
      !Number.isFinite(parsedUnits) ||
      parsedUnits <= 0 ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setFormError(copy.validationError);
      return;
    }

    const parsedTariff = parseFloat(tariff);
    const effectiveTariff =
      Number.isFinite(parsedTariff) && parsedTariff > 0
        ? Number(parsedTariff.toFixed(2))
        : Number((parsedAmount / parsedUnits).toFixed(2));

    const safeDays =
      Number.isFinite(parsedDays) && parsedDays >= 7 && parsedDays <= 120
        ? parsedDays
        : 30;

    onConfirm({
      unitsConsumed: Number(parsedUnits.toFixed(1)),
      totalAmountInr: Number(parsedAmount.toFixed(2)),
      billingPeriod:
        period.trim() || (language === 'hi' ? 'मासिक बिल चक्र' : 'Monthly Billing Cycle'),
      tariffRatePerUnit: effectiveTariff,
      billingDays: safeDays,
      providerName:
        providerName.trim() ||
        (language === 'hi' ? 'राज्य बिजली बोर्ड' : 'Indian Electricity DISCOM'),
      consumerLocation:
        extraction?.consumerLocation || initialValues?.consumerLocation || 'India',
    });
  };

  const fieldHighlight = (field: EditableField) =>
    missingSet.has(field)
      ? 'border-amber-500 bg-amber-50/50 focus:border-amber-600 focus:ring-amber-500/20'
      : 'border-[#0D3B2E]/15 bg-white focus:border-[#0D3B2E] focus:ring-[#0D3B2E]/15';

  return (
    <div className="rounded-3xl border border-[#0D3B2E]/12 bg-white p-5 sm:p-8 shadow-[0_6px_28px_-6px_rgba(13,59,46,0.08)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#0D3B2E]/10">
        <div>
          <h3 className="text-xl font-semibold text-[#0D261F]">{copy.title}</h3>
          {extraction?.providerName && (
            <p className="mt-1 text-sm text-[#4A635B]">
              {extraction.providerName}
              {extraction.consumerLocation ? ` · ${extraction.consumerLocation}` : ''}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onResetUpload}
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-[#0D3B2E]/15 bg-[#F6FAF7] px-4 py-2.5 text-sm font-medium text-[#0D3B2E] hover:bg-[#E6F4EE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{copy.cancelBtn}</span>
        </button>
      </div>

      {extraction && (
        <div
          className={`mt-6 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
            isUnreadable || hasMissing
              ? 'border-amber-300 bg-amber-50/70 text-amber-950'
              : 'border-[#0D3B2E]/15 bg-[#E6F4EE]/70 text-[#0D3B2E]'
          }`}
        >
          {isUnreadable || hasMissing ? (
            <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-[#059669] shrink-0 mt-0.5" />
          )}
          <div className="space-y-1 min-w-0">
            <p className="font-medium">
              {isUnreadable
                ? copy.unreadableAlert
                : hasMissing
                ? copy.partialAlert
                : copy.allFoundAlert}
            </p>
            {extraction.extractionNote?.[language] && (
              <p className="text-xs opacity-85">{extraction.extractionNote[language]}</p>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label htmlFor="ww-units" className="text-sm font-medium text-[#0D261F]">
                {copy.unitsLabel} <span className="text-red-600">*</span>
              </label>
              {missingSet.has('unitsConsumed') && (
                <span className="text-xs font-medium text-amber-700">{copy.missingTag}</span>
              )}
            </div>
            <input
              id="ww-units"
              type="number"
              step="0.1"
              min="1"
              max="50000"
              required
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              onBlur={handleUnitsOrAmountBlur}
              placeholder={copy.unitsPlaceholder}
              className={`w-full rounded-xl border px-4 py-3 font-mono-tabular text-base text-[#0D261F] outline-none focus:ring-2 transition-colors ${fieldHighlight(
                'unitsConsumed'
              )}`}
            />
            <p className="mt-1 text-xs text-[#4A635B]">{copy.unitsHint}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label htmlFor="ww-amount" className="text-sm font-medium text-[#0D261F]">
                {copy.amountLabel} <span className="text-red-600">*</span>
              </label>
              {missingSet.has('totalAmountInr') && (
                <span className="text-xs font-medium text-amber-700">{copy.missingTag}</span>
              )}
            </div>
            <input
              id="ww-amount"
              type="number"
              step="0.01"
              min="1"
              max="1000000"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={handleUnitsOrAmountBlur}
              placeholder={copy.amountPlaceholder}
              className={`w-full rounded-xl border px-4 py-3 font-mono-tabular text-base text-[#0D261F] outline-none focus:ring-2 transition-colors ${fieldHighlight(
                'totalAmountInr'
              )}`}
            />
            <p className="mt-1 text-xs text-[#4A635B]">{copy.amountHint}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label htmlFor="ww-period" className="text-sm font-medium text-[#0D261F]">
                {copy.periodLabel}
              </label>
              {missingSet.has('billingPeriod') && (
                <span className="text-xs font-medium text-amber-700">{copy.missingTag}</span>
              )}
            </div>
            <input
              id="ww-period"
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder={copy.periodPlaceholder}
              className={`w-full rounded-xl border px-4 py-3 text-base text-[#0D261F] outline-none focus:ring-2 transition-colors ${fieldHighlight(
                'billingPeriod'
              )}`}
            />
            <p className="mt-1 text-xs text-[#4A635B]">{copy.periodHint}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label htmlFor="ww-tariff" className="text-sm font-medium text-[#0D261F]">
                {copy.tariffLabel}
              </label>
              {missingSet.has('tariffRatePerUnit') && (
                <span className="text-xs font-medium text-amber-700">{copy.missingTag}</span>
              )}
            </div>
            <input
              id="ww-tariff"
              type="number"
              step="0.01"
              min="0.5"
              max="50"
              value={tariff}
              onChange={(e) => setTariff(e.target.value)}
              placeholder={copy.tariffPlaceholder}
              className={`w-full rounded-xl border px-4 py-3 font-mono-tabular text-base text-[#0D261F] outline-none focus:ring-2 transition-colors ${fieldHighlight(
                'tariffRatePerUnit'
              )}`}
            />
            <p className="mt-1 text-xs text-[#4A635B]">{copy.tariffHint}</p>
          </div>

          <div>
            <label htmlFor="ww-provider" className="block text-sm font-medium text-[#0D261F] mb-1.5">
              {copy.providerLabel}
            </label>
            <input
              id="ww-provider"
              type="text"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder={copy.providerPlaceholder}
              className="w-full rounded-xl border border-[#0D3B2E]/15 bg-white px-4 py-3 text-base text-[#0D261F] outline-none focus:border-[#0D3B2E] focus:ring-2 focus:ring-[#0D3B2E]/15 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="ww-days" className="block text-sm font-medium text-[#0D261F] mb-1.5">
              {copy.daysLabel}
            </label>
            <select
              id="ww-days"
              value={billingDays}
              onChange={(e) => setBillingDays(e.target.value)}
              className="w-full rounded-xl border border-[#0D3B2E]/15 bg-white px-4 py-3 font-mono-tabular text-base text-[#0D261F] outline-none focus:border-[#0D3B2E] focus:ring-2 focus:ring-[#0D3B2E]/15 transition-colors"
            >
              <option value="30">{copy.dayOptions.d30}</option>
              <option value="60">{copy.dayOptions.d60}</option>
              <option value="31">{copy.dayOptions.d31}</option>
              <option value="28">{copy.dayOptions.d28}</option>
            </select>
          </div>
        </div>

        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {formError}
          </div>
        )}

        <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#0D3B2E] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#134E3A] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>{isSubmitting ? copy.submittingBtn : copy.submitBtn}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
