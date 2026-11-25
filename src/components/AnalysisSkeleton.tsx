import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Language } from '../types/bill';
import { UI_COPY } from '../data/translations';

interface AnalysisSkeletonProps {
  language: Language;
  mode?: 'extracting' | 'tips';
}

export function AnalysisSkeleton({ language, mode = 'extracting' }: AnalysisSkeletonProps) {
  const copy = UI_COPY[language].upload;
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const startIdx = mode === 'tips' ? 2 : 0;
    setStepIdx(startIdx);
    const timer = window.setInterval(() => {
      setStepIdx((prev) => (prev + 1) % copy.analyzingSteps.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, [mode, copy.analyzingSteps.length]);

  return (
    <div
      className="rounded-2xl border border-[#0D3B2E]/12 bg-white p-6 md:p-8 shadow-sm"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6F4EE] text-[#0D3B2E]">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#0D261F]">{copy.analyzingTitle}</h3>
          <p className="text-sm text-[#4A635B]">{copy.analyzingSteps[stepIdx]}</p>
        </div>
      </div>

      {/* KPI Skeleton Grid matching Dashboard Geometry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[0, 1, 2, 3].map((idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[#0D3B2E]/8 bg-[#F6FAF7] p-5 space-y-3"
          >
            <div className="h-3.5 w-24 rounded bg-[#D8EAE0] animate-pulse" />
            <div className="h-8 w-28 rounded bg-[#CBE3D6] animate-pulse" />
            <div className="h-3 w-32 rounded bg-[#E3EFE8] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Chart + Score Skeleton Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 rounded-xl border border-[#0D3B2E]/8 bg-[#F6FAF7] p-6 space-y-4">
          <div className="h-5 w-52 rounded bg-[#D8EAE0] animate-pulse" />
          <div className="h-3.5 w-72 rounded bg-[#E3EFE8] animate-pulse" />
          <div className="pt-4 space-y-4">
            <div className="h-10 w-full rounded-lg bg-[#D8EAE0] animate-pulse" />
            <div className="h-10 w-2/5 rounded-lg bg-[#CBE3D6] animate-pulse" />
          </div>
        </div>
        <div className="lg:col-span-5 rounded-xl border border-[#0D3B2E]/8 bg-[#F6FAF7] p-6 space-y-4">
          <div className="h-5 w-44 rounded bg-[#D8EAE0] animate-pulse" />
          <div className="flex items-center gap-4 pt-2">
            <div className="h-24 w-24 rounded-full bg-[#CBE3D6] animate-pulse shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="h-4 w-full rounded bg-[#D8EAE0] animate-pulse" />
              <div className="h-4 w-5/6 rounded bg-[#E3EFE8] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
