import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Leaf, ArrowUpRight, Upload, Globe, SlidersHorizontal } from 'lucide-react';
import {
  AnalysisResult,
  BillExtractionResponse,
  Language,
  ValidatedBillInput,
} from './types/bill';
import { UI_COPY } from './data/translations';
import { DEMO_BILLS } from './data/demoBills';
import { BillUploadPanel } from './components/BillUploadPanel';
import { AnalysisSkeleton } from './components/AnalysisSkeleton';
import { BillReviewForm } from './components/BillReviewForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ApplianceSimulator } from './components/ApplianceSimulator';

type WorkspaceStage =
  | 'upload'
  | 'analyzing-bill'
  | 'review'
  | 'analyzing-tips'
  | 'results';

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [stage, setStage] = useState<WorkspaceStage>('upload');
  const [extraction, setExtraction] = useState<BillExtractionResponse | null>(null);
  const [manualSeed, setManualSeed] = useState<Partial<ValidatedBillInput> | undefined>(
    undefined
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const analyzerSectionRef = useRef<HTMLElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const copy = UI_COPY[language];

  const scrollToAnalyzer = () => {
    analyzerSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleTryDemo = (demoId = 'delhi-summer') => {
    const preset = DEMO_BILLS.find((d) => d.id === demoId) || DEMO_BILLS[0];
    setErrorMessage(null);
    setExtraction(null);
    setManualSeed(undefined);
    setActiveDemoId(preset.id);
    setAnalysisResult(preset.result);
    setStage('results');
    setTimeout(scrollToAnalyzer, 60);
  };

  const handleFileSelected = async (file: File) => {
    setErrorMessage(null);
    setActiveDemoId(null);
    setManualSeed(undefined);
    setStage('analyzing-bill');
    setTimeout(scrollToAnalyzer, 60);

    try {
      const base64Data = await readFileAsBase64(file);
      const mimeType =
        file.type ||
        (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

      const response = await fetch('/api/analyze-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileData: base64Data,
          mimeType,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setErrorMessage(
          payload?.message ||
            (language === 'hi'
              ? 'बिल पढ़ने में समस्या आई। कृपया पुनः प्रयास करें या मान खुद भरें।'
              : 'Could not read that bill file. Please try again or enter values manually.')
        );
        setStage('upload');
        return;
      }

      setExtraction(payload as BillExtractionResponse);
      setStage('review');
    } catch {
      setErrorMessage(
        language === 'hi'
          ? 'नेटवर्क त्रुटि के कारण बिल का विश्लेषण नहीं हो सका। कृपया पुनः प्रयास करें।'
          : 'Network error while analyzing your bill. Please try again or try a demo bill.'
      );
      setStage('upload');
    }
  };

  const handleConfirmBillValues = async (validated: ValidatedBillInput) => {
    setErrorMessage(null);
    setActiveDemoId(null);
    setStage('analyzing-tips');
    setTimeout(scrollToAnalyzer, 60);

    try {
      const response = await fetch('/api/generate-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      const payload = await response.json();

      if (!response.ok) {
        setErrorMessage(
          payload?.message ||
            (language === 'hi'
              ? 'बचत उपाय बनाने में समस्या आई। कृपया पुनः प्रयास करें।'
              : 'Could not generate saving tips right now. Please try again.')
        );
        setManualSeed(validated);
        setStage('review');
        return;
      }

      setAnalysisResult(payload as AnalysisResult);
      setStage('results');
    } catch {
      setErrorMessage(
        language === 'hi'
          ? 'सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।'
          : 'Unable to reach the server. Please try again.'
      );
      setManualSeed(validated);
      setStage('review');
    }
  };

  const handleManualEntry = () => {
    setErrorMessage(null);
    setExtraction(null);
    setManualSeed({
      billingDays: 30,
      billingPeriod: language === 'hi' ? 'अक्टूबर 2026' : 'Oct 2026',
    });
    setStage('review');
    setTimeout(scrollToAnalyzer, 60);
  };

  const handleEditExistingResult = () => {
    if (!analysisResult) return;
    setErrorMessage(null);
    setExtraction(null);
    setManualSeed(analysisResult.bill);
    setStage('review');
    setTimeout(scrollToAnalyzer, 60);
  };

  const handleResetUpload = () => {
    setErrorMessage(null);
    setExtraction(null);
    setManualSeed(undefined);
    setStage('upload');
    setTimeout(scrollToAnalyzer, 60);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5FAF7] text-[#0D261F] overflow-x-hidden">
      {/* Hidden quick-upload input triggered from Hero Upload CTA */}
      <input
        ref={heroFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            handleFileSelected(f);
          }
          e.target.value = '';
        }}
      />

      {/* Top Navigation Bar: Strict 3-Zone Contract */}
      <header className="sticky top-0 z-40 border-b border-[#0D3B2E]/10 bg-[#F5FAF7]/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <a
            href="#top"
            className="font-display text-xl font-bold tracking-tight text-[#0D3B2E] whitespace-nowrap shrink-0"
          >
            {copy.brand}
          </a>

          {/* Zone 2: 4 clean single-line nav links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#2D473F]"
          >
            <a
              href="#how-it-works"
              className="hover:text-[#0D3B2E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {copy.nav.howItWorks}
            </a>
            <a
              href="#analyzer"
              className="hover:text-[#0D3B2E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {copy.nav.analyzer}
            </a>
            <a
              href="#simulator"
              className="hover:text-[#0D3B2E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              {copy.nav.simulator}
            </a>
            <button
              type="button"
              onClick={() => handleTryDemo('delhi-summer')}
              className="hover:text-[#0D3B2E] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copy.nav.demoBills}
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => {
                setStage('upload');
                scrollToAnalyzer();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D3B2E] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-[#134E3A] transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{copy.nav.uploadBill}</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="flex-1">
        {/* Bold, Premium Hero Section */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 pb-14 md:pt-10 md:pb-20">
          {/* Workspace Toolbar: Kicker + English/Hindi Segmented Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#0D3B2E]/10 mb-8 md:mb-10">
            <p className="text-xs sm:text-sm font-medium text-[#2D473F]">
              {copy.hero.kicker}
            </p>

            {/* English / हिन्दी Language Toggle */}
            <div
              role="group"
              aria-label="Language switcher"
              className="inline-flex items-center gap-1 rounded-xl border border-[#0D3B2E]/15 bg-white p-1 shadow-xs"
            >
              <Globe className="h-3.5 w-3.5 text-[#4A635B] ml-2 mr-1" aria-hidden="true" />
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#0D3B2E] text-white'
                    : 'text-[#2D473F] hover:bg-[#E6F4EE]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  language === 'hi'
                    ? 'bg-[#0D3B2E] text-white'
                    : 'text-[#2D473F] hover:bg-[#E6F4EE]'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          {/* 2-Column Hero Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col justify-center"
            >
              <h1
                className="font-display font-bold tracking-tight text-[#0A241C] leading-[1.06]"
                style={{
                  fontSize: 'clamp(2.25rem, 4.5vw, 3.85rem)',
                  textWrap: 'balance',
                }}
              >
                {copy.hero.headline}
              </h1>

              <p className="mt-5 text-base sm:text-lg leading-relaxed text-[#2D473F] max-w-xl">
                {copy.hero.subcopy}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => handleTryDemo('delhi-summer')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0D3B2E] px-6 py-3.5 text-sm sm:text-base font-semibold text-white hover:bg-[#134E3A] transition-colors whitespace-nowrap shrink-0 shadow-[0_10px_24px_-6px_rgba(13,59,46,0.35)] cursor-pointer"
                >
                  <span>{copy.hero.primaryCta}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => heroFileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#0D3B2E]/20 bg-white px-6 py-3.5 text-sm sm:text-base font-semibold text-[#0D261F] hover:bg-[#E6F4EE] transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
                >
                  <Upload className="h-4 w-4 text-[#0D3B2E]" />
                  <span>{copy.hero.secondaryCta}</span>
                </button>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-3 text-xs text-[#4A635B]">
                <a
                  href="#simulator"
                  className="inline-flex items-center gap-1.5 font-semibold text-[#0D3B2E] hover:underline underline-offset-4 w-fit"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>{copy.hero.simulatorLink}</span>
                </a>
              </div>

              <p className="mt-4 text-xs text-[#4A635B] leading-relaxed">
                {copy.hero.trustLine}
              </p>
            </motion.div>

            {/* Right Visual Focal Carrier */}
            <motion.div
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex flex-col"
            >
              <div className="relative flex-1 min-h-[260px] sm:min-h-[320px] lg:min-h-[410px] rounded-3xl overflow-hidden border border-[#0D3B2E]/12 bg-[#E6F4EE] shadow-[0_18px_45px_-12px_rgba(13,59,46,0.2)]">
                {!heroImgFailed ? (
                  <img
                    src="/src/assets/images/wattwise_eco_home_hero_1795586210230.jpg"
                    alt={copy.hero.imageAlt}
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full lg:h-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-[#E6F4EE] to-[#CBE3D6]">
                    <Leaf className="h-12 w-12 text-[#0D3B2E] mb-3" />
                    <p className="font-display text-lg font-semibold text-[#0D261F]">
                      {copy.hero.captionTitle}
                    </p>
                  </div>
                )}

                {/* Subtle bottom scrim caption inside hero image */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#061D17]/85 via-[#061D17]/40 to-transparent p-5 sm:p-6 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-[#A7F3D0] font-medium">
                        {copy.hero.highlightLabel}
                      </p>
                      <p className="font-mono-tabular text-base sm:text-lg font-bold">
                        {copy.hero.highlightValue}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-[#D1FAE5]">{copy.hero.captionTitle}</p>
                      <p className="font-mono-tabular text-xs sm:text-sm font-semibold">
                        {copy.hero.captionStat}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Main Analyzer / Results Workspace */}
        <section
          id="analyzer"
          ref={analyzerSectionRef}
          className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16 border-t border-[#0D3B2E]/10 scroll-mt-20"
        >
          {stage !== 'results' && (
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0D261F] tracking-tight">
                {copy.upload.sectionTitle}
              </h2>
              <p className="mt-1.5 text-sm sm:text-base text-[#4A635B]">
                {copy.upload.sectionSubtitle}
              </p>
            </div>
          )}

          {stage === 'upload' && (
            <BillUploadPanel
              language={language}
              errorMessage={errorMessage}
              onFileSelected={handleFileSelected}
              onTryDemo={handleTryDemo}
              onManualEntry={handleManualEntry}
              onClearError={() => setErrorMessage(null)}
            />
          )}

          {stage === 'analyzing-bill' && (
            <AnalysisSkeleton language={language} mode="extracting" />
          )}

          {stage === 'review' && (
            <div className="space-y-4">
              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                >
                  {errorMessage}
                </div>
              )}
              <BillReviewForm
                language={language}
                extraction={extraction}
                initialValues={manualSeed}
                isSubmitting={false}
                onConfirm={handleConfirmBillValues}
                onResetUpload={handleResetUpload}
              />
            </div>
          )}

          {stage === 'analyzing-tips' && (
            <AnalysisSkeleton language={language} mode="tips" />
          )}

          {stage === 'results' && analysisResult && (
            <ResultsDashboard
              language={language}
              result={analysisResult}
              activeDemoId={activeDemoId}
              onSelectDemo={handleTryDemo}
              onEditValues={handleEditExistingResult}
              onUploadAnother={handleResetUpload}
            />
          )}
        </section>

        {/* Interactive Appliance Simulator Section */}
        <ApplianceSimulator
          language={language}
          defaultTariffRate={analysisResult?.bill.tariffRatePerUnit ?? 7.5}
          isGeneratingTips={stage === 'analyzing-tips'}
          onGenerateAiTips={handleConfirmBillValues}
        />

        {/* How It Works: 3 Clear Steps */}
        <section
          id="how-it-works"
          className="mx-auto max-w-6xl px-4 sm:px-6 py-14 md:py-20 border-t border-[#0D3B2E]/10"
        >
          <div className="max-w-2xl mb-10">
            <h2
              className="text-2xl sm:text-3xl font-bold text-[#0D261F] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              {copy.howItWorks.heading}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#4A635B]">
              {copy.howItWorks.subheading}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {copy.howItWorks.steps.map((step) => (
              <div
                key={step.num}
                className="rounded-3xl border border-[#0D3B2E]/10 bg-white p-6 sm:p-7 shadow-[0_4px_22px_-4px_rgba(13,59,46,0.07)] flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono-tabular text-sm font-bold text-[#059669]">
                    {step.num}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold text-[#0D261F]">
                    {step.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#4A635B]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-[#0D3B2E]/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#4A635B]">
          <p>{copy.footer.note}</p>
          <p className="font-mono-tabular">{copy.footer.factor}</p>
        </div>
      </footer>
    </div>
  );
}
