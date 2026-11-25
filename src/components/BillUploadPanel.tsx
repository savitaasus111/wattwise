import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertTriangle, Sparkles, Keyboard } from 'lucide-react';
import { Language } from '../types/bill';
import { UI_COPY } from '../data/translations';
import { DEMO_BILLS } from '../data/demoBills';

interface BillUploadPanelProps {
  language: Language;
  errorMessage: string | null;
  onFileSelected: (file: File) => void;
  onTryDemo: (demoId?: string) => void;
  onManualEntry: () => void;
  onClearError: () => void;
}

const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
]);

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function BillUploadPanel({
  language,
  errorMessage,
  onFileSelected,
  onTryDemo,
  onManualEntry,
  onClearError,
}: BillUploadPanelProps) {
  const copy = UI_COPY[language].upload;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const activeError = localError || errorMessage;

  const validateAndEmit = (file: File | undefined) => {
    if (!file) return;
    setLocalError(null);
    onClearError();

    const typeLower = file.type.toLowerCase();
    const nameLower = file.name.toLowerCase();
    const isPdf = typeLower === 'application/pdf' || nameLower.endsWith('.pdf');
    const isAllowedImage =
      ACCEPTED_TYPES.has(typeLower) ||
      /\.(jpe?g|png|webp|heic)$/i.test(nameLower);

    if (!isPdf && !isAllowedImage) {
      setLocalError(copy.unsupportedType);
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      setLocalError(copy.fileTooLarge);
      return;
    }

    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndEmit(file);
  };

  return (
    <div className="space-y-6">
      {activeError && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50/90 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-950">{copy.errorTitle}</p>
              <p className="text-sm text-red-800 mt-0.5">{activeError}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setLocalError(null);
                onClearError();
                inputRef.current?.click();
              }}
              className="rounded-xl bg-white border border-red-200 px-3.5 py-2.5 text-xs font-semibold text-red-900 hover:bg-red-100/60 transition-colors whitespace-nowrap cursor-pointer"
            >
              {copy.errorRetry}
            </button>
            <button
              type="button"
              onClick={onManualEntry}
              className="rounded-xl bg-white border border-red-200 px-3.5 py-2.5 text-xs font-semibold text-[#0D3B2E] hover:bg-[#E6F4EE] transition-colors whitespace-nowrap cursor-pointer"
            >
              {copy.errorManual}
            </button>
            <button
              type="button"
              onClick={() => onTryDemo('delhi-summer')}
              className="rounded-xl bg-[#0D3B2E] px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-[#134E3A] transition-colors whitespace-nowrap cursor-pointer"
            >
              {copy.errorDemo}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`lg:col-span-7 rounded-3xl border-2 border-dashed p-6 sm:p-10 flex flex-col items-center justify-center text-center transition-all shadow-[0_6px_26px_-6px_rgba(13,59,46,0.07)] ${
            isDragging
              ? 'border-[#0D3B2E] bg-[#E6F4EE]'
              : 'border-[#0D3B2E]/20 bg-white hover:border-[#0D3B2E]/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
            className="hidden"
            onChange={(e) => {
              validateAndEmit(e.target.files?.[0]);
              e.target.value = '';
            }}
          />

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6F4EE] text-[#0D3B2E] mb-4">
            <UploadCloud className="h-7 w-7" />
          </div>

          <h3 className="text-xl font-semibold text-[#0D261F]">{copy.dropTitle}</h3>
          <p className="mt-1.5 text-sm text-[#4A635B] max-w-md">{copy.dropHint}</p>

          <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D3B2E] px-5 py-3 text-sm font-semibold text-white hover:bg-[#134E3A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>{copy.chooseFile}</span>
            </button>

            <button
              type="button"
              onClick={onManualEntry}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#0D3B2E]/15 bg-[#F6FAF7] px-4 py-3 text-sm font-medium text-[#0D261F] hover:bg-[#E6F4EE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Keyboard className="h-4 w-4 text-[#0D3B2E]" />
              <span>{copy.manualEntryLink}</span>
            </button>
          </div>
        </div>

        {/* Instant Sample DISCOM Bills */}
        <div
          id="demo-bills"
          className="lg:col-span-5 rounded-3xl border border-[#0D3B2E]/12 bg-white p-6 sm:p-7 shadow-[0_6px_26px_-6px_rgba(13,59,46,0.07)] flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] mb-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{copy.orTryDemo}</span>
            </div>
            <h4 className="text-lg font-semibold text-[#0D261F]">
              {language === 'hi'
                ? 'तुरंत सैंपल भारतीय बिल आज़माएं'
                : 'Test a sample Indian bill'}
            </h4>
            <p className="text-xs sm:text-sm text-[#4A635B] mt-1 mb-4">
              {language === 'hi'
                ? 'बिना फोटो अपलोड किए तुरंत डैशबोर्ड और सुझाव देखें।'
                : 'Explore the full dashboard, CO₂ impact, and saving tips in one click.'}
            </p>

            <div className="space-y-3">
              {DEMO_BILLS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => onTryDemo(demo.id)}
                  className="w-full text-left rounded-2xl border border-[#0D3B2E]/10 bg-[#F6FAF7] px-4 py-3.5 hover:border-[#0D3B2E]/30 hover:bg-[#E6F4EE]/80 transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0D261F]">
                      {demo.name[language]}
                    </p>
                    <p className="text-xs text-[#4A635B] mt-0.5">{demo.subtitle[language]}</p>
                  </div>
                  <span className="font-mono-tabular text-sm font-semibold text-[#0D3B2E] shrink-0">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
