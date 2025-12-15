// Drop-in replacement for swisseph using Penguin Alpha with fallback
let penguinAlpha: any = null;
let fallbackWasm: any = null;
let usingFallback = false;

// Swiss Ephemeris constants (identical to original)
export const SE_SUN = 0;
export const SE_MOON = 1;
export const SE_MERCURY = 2;
export const SE_VENUS = 3;
export const SE_MARS = 4;
export const SE_JUPITER = 5;
export const SE_SATURN = 6;
export const SE_URANUS = 7;
export const SE_NEPTUNE = 8;
export const SE_PLUTO = 9;
export const SE_MEAN_NODE = 10;
export const SE_TRUE_NODE = 11;

export const SEFLG_SPEED = 256;
export const SEFLG_SWIEPH = 2;
export const SEFLG_SIDEREAL = 64;

// Initialize Penguin Alpha or fallback
async function initializeEphemeris() {
  if (penguinAlpha || fallbackWasm) return;

  try {
    // Try Penguin Alpha first
    penguinAlpha = await import('@penguin-alpha/core');
    console.log('✅ Penguin Alpha loaded successfully');
    usingFallback = false;
    return true;
  } catch (error) {
    console.warn('⚠️ Penguin Alpha failed, trying fallback...');
    try {
      // Fallback to swe-1 WASM
      fallbackWasm = await import('swe-1');
      console.log('✅ Using swe-1 WASM fallback');
      usingFallback = true;
      return true;
    } catch (fallbackError) {
      console.error('❌ Both ephemeris libraries failed');
      return false;
    }
  }
}

// Drop-in swisseph functions
export function swe_set_ephe_path(path?: string) {
  // Initialize if needed
  if (!penguinAlpha && !fallbackWasm) {
    initializeEphemeris();
  }
  
  if (penguinAlpha) {
    return penguinAlpha.setEphePath?.(path);
  }
  
  if (fallbackWasm) {
    return fallbackWasm.setEphePath?.(path);
  }
}

export function swe_calc_ut(jd: number, planet: number, flags: number) {
  if (!penguinAlpha && !fallbackWasm) {
    initializeEphemeris();
  }
  
  if (penguinAlpha) {
    return penguinAlpha.calcUt?.(jd, planet, flags);
  }
  
  if (fallbackWasm) {
    return fallbackWasm.calcUt?.(jd, planet, flags);
  }
  
  throw new Error('Ephemeris not initialized');
}

export function swe_houses_ex(jd: number, lat: number, lon: number, hsys: string) {
  if (!penguinAlpha && !fallbackWasm) {
    initializeEphemeris();
  }
  
  if (penguinAlpha) {
    return penguinAlpha.housesEx?.(jd, lat, lon, hsys);
  }
  
  if (fallbackWasm) {
    return fallbackWasm.housesEx?.(jd, lat, lon, hsys);
  }
  
  throw new Error('Ephemeris not initialized');
}

export function swe_close() {
  if (penguinAlpha) {
    return penguinAlpha.close?.();
  }
  
  if (fallbackWasm) {
    return fallbackWasm.close?.();
  }
}