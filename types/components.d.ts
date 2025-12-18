import { BirthData } from '@/app/dashboard/page';

declare module '@/components/astrology/BirthChartDisplay' {
  interface BirthChartDisplayProps {
    birthData: BirthData;
  }
  const BirthChartDisplay: React.FC<BirthChartDisplayProps>;
  export default BirthChartDisplay;
}

declare module '@/components/dashboard/ResonanceInsights' {
  interface ResonanceInsightsProps {
    userId: string;
    birthData: BirthData | null;
  }
  const ResonanceInsights: React.FC<ResonanceInsightsProps>;
  export default ResonanceInsights;
}
