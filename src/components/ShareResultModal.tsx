import { useEffect, useState } from 'react';
import { Download, X, Leaf, Check } from 'lucide-react';
import { AnalysisResult, Language } from '../types/bill';
import { UI_COPY } from '../data/translations';

interface ShareResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: AnalysisResult;
  language: Language;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function ShareResultModal({
  isOpen,
  onClose,
  result,
  language,
}: ShareResultModalProps) {
  const copy = UI_COPY[language].shareModal;
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDownloaded(false);
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const triggerDownload = (url: string, revokeAfter = false) => {
    const link = document.createElement('a');
    link.download = `wattwise-energy-report-${language}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (revokeAfter) {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleDownloadPng = async () => {
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready.catch(() => undefined);
    }

    const canvas = document.createElement('canvas');
    const width = 1200;
    const height = 675;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0D3B2E';
    ctx.fillRect(0, 0, width, height);

    const grad = ctx.createRadialGradient(1040, 110, 40, 1040, 110, 420);
    grad.addColorStop(0, 'rgba(167, 243, 208, 0.18)');
    grad.addColorStop(1, 'rgba(13, 59, 46, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Inner clean white summary card
    drawRoundedRect(ctx, 48, 48, width - 96, height - 96, 28);
    ctx.fillStyle = '#F7FBF8';
    ctx.fill();

    // Header row
    ctx.fillStyle = '#0D3B2E';
    ctx.font = '700 34px "Bricolage Grotesque", "Plus Jakarta Sans", sans-serif';
    ctx.fillText('WattWise', 88, 112);

    ctx.fillStyle = '#4A635B';
    ctx.font = '500 20px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
    ctx.fillText(copy.cardTagline, 88, 146);

    // Provider & period right-aligned
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0D261F';
    ctx.font = '600 20px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
    ctx.fillText(result.bill.providerName, width - 88, 110);
    ctx.fillStyle = '#4A635B';
    ctx.font = '500 18px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
    ctx.fillText(result.bill.billingPeriod, width - 88, 140);
    ctx.textAlign = 'left';

    // Divider
    ctx.strokeStyle = 'rgba(13, 59, 46, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(88, 174);
    ctx.lineTo(width - 88, 174);
    ctx.stroke();

    // 3 metric tiles
    const metrics = [
      {
        label: copy.cardUnits,
        value: `${result.bill.unitsConsumed} kWh`,
      },
      {
        label: copy.cardBill,
        value: `₹${result.bill.totalAmountInr.toLocaleString('en-IN')}`,
      },
      {
        label: copy.cardCostUnit,
        value: `₹${result.bill.tariffRatePerUnit.toFixed(2)} / kWh`,
      },
    ];

    const tileW = 324;
    const gap = 26;
    metrics.forEach((m, idx) => {
      const x = 88 + idx * (tileW + gap);
      const y = 204;
      drawRoundedRect(ctx, x, y, tileW, 134, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = 'rgba(13, 59, 46, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#4A635B';
      ctx.font = '500 18px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
      ctx.fillText(m.label, x + 26, y + 44);

      ctx.fillStyle = '#0D261F';
      ctx.font = '700 36px "JetBrains Mono", monospace';
      ctx.fillText(m.value, x + 26, y + 98);
    });

    // Bottom Highlight Row
    drawRoundedRect(ctx, 88, 368, 496, 172, 20);
    ctx.fillStyle = '#E6F4EE';
    ctx.fill();

    ctx.fillStyle = '#0D3B2E';
    ctx.font = '600 18px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
    ctx.fillText(copy.cardFootprint, 118, 412);
    ctx.font = '700 38px "JetBrains Mono", monospace';
    ctx.fillText(`${result.carbonFootprintKg} kg CO₂`, 118, 462);

    ctx.fillStyle = '#2D473F';
    ctx.font = '600 20px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
    ctx.fillText(`${copy.cardScore}: ${result.efficiencyScore} / 100`, 118, 508);

    drawRoundedRect(ctx, 610, 368, 502, 172, 20);
    ctx.fillStyle = '#0D3B2E';
    ctx.fill();

    ctx.fillStyle = '#A7F3D0';
    ctx.font = '600 18px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
    ctx.fillText(copy.cardPotentialSavings, 642, 412);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 40px "JetBrains Mono", monospace';
    ctx.fillText(
      `₹${result.totalMonthlyRupeesSaved.toLocaleString('en-IN')} ${copy.cardPerMonth}`,
      642,
      466
    );

    ctx.fillStyle = '#D1FAE5';
    ctx.font = '500 20px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
    ctx.fillText(
      `-${result.totalMonthlyCo2SavedKg} kg CO₂ ${copy.cardPerMonth}`,
      642,
      508
    );

    ctx.fillStyle = '#4A635B';
    ctx.font = '500 16px "Plus Jakarta Sans", "Noto Sans Devanagari", sans-serif';
    ctx.fillText(copy.cardFooterNote, 88, 592);

    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (blob) {
          const objUrl = URL.createObjectURL(blob);
          triggerDownload(objUrl, true);
        } else {
          triggerDownload(canvas.toDataURL('image/png'), false);
        }
      }, 'image/png');
    } else {
      triggerDownload(canvas.toDataURL('image/png'), false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#061D17]/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-[#0D3B2E]/15 bg-white p-5 sm:p-8 shadow-2xl my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="min-w-0">
            <h3 id="share-modal-title" className="text-lg sm:text-xl font-semibold text-[#0D261F]">
              {copy.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#4A635B] mt-1">{copy.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="rounded-xl p-2 text-[#4A635B] hover:bg-[#E6F4EE] hover:text-[#0D261F] transition-colors shrink-0 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile-safe Visual Card Preview */}
        <div className="rounded-2xl bg-[#0D3B2E] p-3.5 sm:p-5">
          <div className="rounded-xl bg-[#F7FBF8] p-4 sm:p-6 space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-4 border-b border-[#0D3B2E]/12">
              <div>
                <div className="flex items-center gap-2 text-[#0D3B2E] font-display text-lg font-bold">
                  <Leaf className="h-4 w-4 text-[#059669]" />
                  <span>WattWise</span>
                </div>
                <p className="text-xs text-[#4A635B] mt-0.5">{copy.cardTagline}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-xs font-semibold text-[#0D261F]">{result.bill.providerName}</p>
                <p className="text-xs text-[#4A635B]">{result.bill.billingPeriod}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#0D3B2E]/10 bg-white p-3.5">
                <p className="text-xs text-[#4A635B]">{copy.cardUnits}</p>
                <p className="font-mono-tabular text-lg sm:text-xl font-bold text-[#0D261F] mt-1">
                  {result.bill.unitsConsumed} kWh
                </p>
              </div>
              <div className="rounded-xl border border-[#0D3B2E]/10 bg-white p-3.5">
                <p className="text-xs text-[#4A635B]">{copy.cardBill}</p>
                <p className="font-mono-tabular text-lg sm:text-xl font-bold text-[#0D261F] mt-1">
                  ₹{result.bill.totalAmountInr.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="rounded-xl border border-[#0D3B2E]/10 bg-white p-3.5">
                <p className="text-xs text-[#4A635B]">{copy.cardCostUnit}</p>
                <p className="font-mono-tabular text-lg sm:text-xl font-bold text-[#0D261F] mt-1">
                  ₹{result.bill.tariffRatePerUnit.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#E6F4EE] p-4">
                <p className="text-xs font-medium text-[#0D3B2E]">{copy.cardFootprint}</p>
                <p className="font-mono-tabular text-xl font-bold text-[#0D261F] mt-1">
                  {result.carbonFootprintKg} kg CO₂
                </p>
                <p className="text-xs font-semibold text-[#0D3B2E] mt-2">
                  {copy.cardScore}: {result.efficiencyScore} / 100
                </p>
              </div>
              <div className="rounded-xl bg-[#0D3B2E] p-4 text-white">
                <p className="text-xs font-medium text-[#A7F3D0]">{copy.cardPotentialSavings}</p>
                <p className="font-mono-tabular text-xl font-bold mt-1">
                  ₹{result.totalMonthlyRupeesSaved.toLocaleString('en-IN')} {copy.cardPerMonth}
                </p>
                <p className="text-xs text-[#D1FAE5] mt-2">
                  -{result.totalMonthlyCo2SavedKg} kg CO₂ {copy.cardPerMonth}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border border-[#0D3B2E]/15 px-4 py-3 text-sm font-medium text-[#0D261F] hover:bg-[#F6FAF7] transition-colors whitespace-nowrap cursor-pointer"
          >
            {copy.close}
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D3B2E] px-5 py-3 text-sm font-semibold text-white hover:bg-[#134E3A] transition-colors whitespace-nowrap cursor-pointer"
          >
            {downloaded ? <Check className="h-4 w-4 text-[#A7F3D0]" /> : <Download className="h-4 w-4" />}
            <span>
              {downloaded
                ? language === 'hi'
                  ? 'डाउनलोड हो गया!'
                  : 'Downloaded!'
                : copy.downloadPng}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
