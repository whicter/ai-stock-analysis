export interface AnalysisResult {
  sentiment: 'bullish' | 'bearish' | 'neutral';
  technicalPoints: {
    strength: number;
    priceRange: { min: number; max: number; label: string };
    resistance: { level: number; label: string };
    support: { level: number; label: string };
    momentum: { value: number; label: string };
    fibonacci?: {
      type: 'extension' | 'retracement';
      levels: {
        level: number;
        price: number;
        label: string;
      }[];
    };
  };
  report: {
    title: string;
    date: string;
    targetPrice: string;
    sections: {
      coreView: string;
      technicalAnalysis: string;
      fundamentalAnalysis: string;
      riskWarning: string;
    };
  };
}
