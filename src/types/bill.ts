export type Language = 'en' | 'hi';

export type EditableField =
  | 'unitsConsumed'
  | 'totalAmountInr'
  | 'billingPeriod'
  | 'tariffRatePerUnit';

export interface BilingualText {
  en: string;
  hi: string;
}

export interface BillExtractionResponse {
  isElectricityBill: boolean;
  providerName: string | null;
  consumerLocation: string | null;
  unitsConsumed: number | null;
  totalAmountInr: number | null;
  billingPeriod: string | null;
  tariffRatePerUnit: number | null;
  billingDays: number;
  missingFields: EditableField[];
  extractionNote: BilingualText;
}

export interface ValidatedBillInput {
  unitsConsumed: number;
  totalAmountInr: number;
  billingPeriod: string;
  tariffRatePerUnit: number;
  billingDays: number;
  providerName: string;
  consumerLocation: string;
}

export type TipCategory = 'cooling' | 'appliances' | 'lighting' | 'standby' | 'tariff';

export interface SavingTip {
  id: string;
  category: TipCategory;
  title: BilingualText;
  action: BilingualText;
  monthlyRupeesSaved: number;
  monthlyCo2SavedKg: number;
}

export interface AnalysisResult {
  bill: ValidatedBillInput;
  carbonFootprintKg: number;
  monthlyUnitsNormalized: number;
  indianAverageKwh: number;
  efficiencyScore: number;
  efficiencyExplanation: BilingualText;
  tips: SavingTip[];
  totalMonthlyRupeesSaved: number;
  totalMonthlyCo2SavedKg: number;
  isDemo?: boolean;
  demoLabel?: BilingualText;
}

export interface DemoBillPreset {
  id: string;
  name: BilingualText;
  subtitle: BilingualText;
  result: AnalysisResult;
}

export interface ApplianceState {
  id: string;
  name: BilingualText;
  wattageNote: BilingualText;
  watts: number;
  quantity: number;
  maxQuantity: number;
  hoursPerDay: number;
  maxHours: number;
  stepHours: number;
}
