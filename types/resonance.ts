export interface ResonanceInsightsProps {
  userId: string;
  mbtiType?: string;
  currentThemes?: string[];
  birthData?: any; // Consider replacing 'any' with a proper type
}

export interface BirthData {
  date?: string;
  time?: string;
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  // Add other properties as needed
}
