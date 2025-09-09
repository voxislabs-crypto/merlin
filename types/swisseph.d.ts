declare module 'swisseph' {
  export interface SwissEphemerisExtended {
    // Core Functions
    swe_set_ephe_path(path: string): void;
    swe_julday(year: number, month: number, day: number, hour: number, gregflag: number): number;
    swe_calc_ut(
      tjd_ut: number,
      ipl: number,
      iflag: number
    ):
      | { error: string }
      // Ecliptic coordinates (longitude, latitude, distance)
      | { 
          longitude: number;
          latitude: number;
          distance: number;
          longitudeSpeed: number;
          latitudeSpeed: number;
          distanceSpeed: number;
          rflag: number;
        }
      // Equatorial coordinates (right ascension, declination)
      | {
          rectAscension: number;
          declination: number;
          distance: number;
          rectAscensionSpeed: number;
          declinationSpeed: number;
          distanceSpeed: number;
          rflag: number;
        }
      // Cartesian coordinates (x, y, z)
      | {
          x: number;
          y: number;
          z: number;
          dx: number;
          dy: number;
          dz: number;
          rflag: number;
        };
    
    swe_houses(
      tjd_ut: number,
      geolat: number,
      geolon: number,
      hsys: string
    ): { houses: number[]; ascendant: number; mc: number; armc: number; vertex: number; equatorialAscendant: number; kochCoAscendant: number; munkaseyCoAscendant: number; munkaseyPolarAscendant: number; };

    // Calendar Constants
    SE_GREG_CAL: number;
    SE_JUL_CAL: number;

    // Planet Numbers
    SE_SUN: number;
    SE_MOON: number;
    SE_MERCURY: number;
    SE_VENUS: number;
    SE_MARS: number;
    SE_JUPITER: number;
    SE_SATURN: number;
    SE_URANUS: number;
    SE_NEPTUNE: number;
    SE_PLUTO: number;
    SE_MEAN_NODE: number;
    SE_TRUE_NODE: number;
    SE_MEAN_APOG: number;
    SE_OSCU_APOG: number;
    SE_CHIRON: number;
    SE_PHOLUS: number;
    SE_CERES: number;
    SE_PALLAS: number;
    SE_JUNO: number;
    SE_VESTA: number;

    // House Systems
    SE_HSYS_PLACIDUS: string;
    SE_HSYS_KOCH: string;
    SE_HSYS_PORPHYRIUS: string;
    SE_HSYS_REGIOMONTANUS: string;
    SE_HSYS_CAMPANUS: string;
    SE_HSYS_EQUAL: string;
    SE_HSYS_EQUAL_2: string;
    SE_HSYS_VEHICLE: string;
    SE_HSYS_WHOLE_SIGN: string;
    SE_HSYS_MERIDIAN: string;
    SE_HSYS_AZIMUTHAL: string;

    // Calculation Flags
    SEFLG_JPLEPH: number;
    SEFLG_SWIEPH: number;
    SEFLG_MOSEPH: number;
    SEFLG_HELCTR: number;
    SEFLG_TRUEPOS: number;
    SEFLG_J2000: number;
    SEFLG_NONUT: number;
    SEFLG_SPEED3: number;
    SEFLG_SPEED: number;
    SEFLG_NOGDEFL: number;
    SEFLG_NOABERR: number;
    SEFLG_ASTROMETRIC: number;
    SEFLG_EQUATORIAL: number;
    SEFLG_XYZ: number;
    SEFLG_RADIANS: number;
    SEFLG_BARYCTR: number;
    SEFLG_TOPOCTR: number;
    SEFLG_ORBEL_AA: number;
    SEFLG_DEFAULTEPH: number;
  }
  
  const swisseph: SwissEphemerisExtended;
  export = swisseph;
}
