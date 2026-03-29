/**
 * Pollen tracking service using Breezometer API
 * Provides daily pollen levels based on user location
 */

export interface PollenData {
  date: string; // ISO date string
  location: {
    lat: number;
    lng: number;
  };
  pollen: {
    tree: number; // 0-5 scale
    grass: number; // 0-5 scale
    weed: number; // 0-5 scale
    total: number; // 0-5 scale
  };
  dominant: 'tree' | 'grass' | 'weed' | null;
  recommendations: string[];
}

export interface BreezometerResponse {
  data: {
    datetime: string;
    data_available: boolean;
    indexes: {
      pollen: {
        tree: number;
        grass: number;
        weed: number;
        total: number;
        dominant: string;
      };
    };
  };
}

/**
 * Get pollen data for a specific location
 */
export async function getPollenData(lat: number, lng: number): Promise<PollenData | null> {
  const apiKey = process.env.BREEZOMETER_API_KEY;

  if (!apiKey) {
    console.warn('BREEZOMETER_API_KEY not configured');
    return null;
  }

  try {
    const url = `https://api.breezometer.com/air-quality/v2/current-conditions?lat=${lat}&lon=${lng}&key=${apiKey}&features=pollen`;

    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Breezometer API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: BreezometerResponse = await response.json();

    if (!data.data.data_available || !data.data.indexes?.pollen) {
      console.warn('Pollen data not available for this location');
      return null;
    }

    const pollen = data.data.indexes.pollen;

    // Convert Breezometer scale (0-500+) to 0-5 scale
    const normalizePollenLevel = (level: number): number => {
      if (level <= 20) return 0; // Low
      if (level <= 50) return 1; // Low-Moderate
      if (level <= 100) return 2; // Moderate
      if (level <= 200) return 3; // Moderate-High
      if (level <= 300) return 4; // High
      return 5; // Very High
    };

    const tree = normalizePollenLevel(pollen.tree);
    const grass = normalizePollenLevel(pollen.grass);
    const weed = normalizePollenLevel(pollen.weed);
    const total = Math.max(tree, grass, weed);

    // Determine dominant pollen type
    let dominant: 'tree' | 'grass' | 'weed' | null = null;
    if (tree > grass && tree > weed) dominant = 'tree';
    else if (grass > tree && grass > weed) dominant = 'grass';
    else if (weed > tree && weed > grass) dominant = 'weed';

    // Generate recommendations based on pollen levels
    const recommendations: string[] = [];
    if (total >= 4) {
      recommendations.push('High pollen levels - consider staying indoors');
      recommendations.push('Keep windows closed and use air purifiers');
    } else if (total >= 3) {
      recommendations.push('Moderate to high pollen levels - limit outdoor activities');
    } else if (total >= 2) {
      recommendations.push('Moderate pollen levels - monitor symptoms');
    }

    if (dominant) {
      const typeMessages = {
        tree: 'Tree pollen is dominant - avoid parks and wooded areas',
        grass: 'Grass pollen is dominant - avoid lawns and fields',
        weed: 'Weed pollen is dominant - ragweed season may be active',
      };
      recommendations.push(typeMessages[dominant]);
    }

    return {
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      location: { lat, lng },
      pollen: { tree, grass, weed, total },
      dominant,
      recommendations,
    };
  } catch (error) {
    console.error('Error fetching pollen data:', error);
    return null;
  }
}

/**
 * Get pollen level description for display
 */
export function getPollenLevelDescription(level: number): string {
  switch (level) {
    case 0: return 'Very Low';
    case 1: return 'Low';
    case 2: return 'Moderate';
    case 3: return 'High';
    case 4: return 'Very High';
    case 5: return 'Extreme';
    default: return 'Unknown';
  }
}