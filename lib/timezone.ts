// Timezone handling utilities for accurate birth time calculations
import { format, toZonedTime, fromZonedTime } from 'date-fns-tz';

export interface TimezoneInfo {
  timezone: string;
  offset: number; // UTC offset in hours
  isDST: boolean;
  localTime: Date;
  utcTime: Date;
}

export interface BirthData {
  date: Date;
  latitude: number;
  longitude: number;
  timezone?: string;
  localTime?: Date;
}

/**
 * Convert a local date/time to UTC with proper timezone handling
 */
export function convertToUTC(
  localDate: Date, 
  timezone: string
): { utcDate: Date; timezoneInfo: TimezoneInfo } {
  try {
    // Validate timezone
    if (!isValidTimezone(timezone)) {
      throw new Error(`Invalid timezone: ${timezone}`);
    }

    // Convert local time to UTC
    const utcDate = fromZonedTime(localDate, timezone);
    
    // Get timezone info
    const zonedTime = toZonedTime(utcDate, timezone);
    const offset = parseInt(format(zonedTime, 'XXX', { timeZone: timezone }).replace(':', '').replace('+', ''), 10) / 100;
    
    // Check if DST is active (this is a simplified check)
    const winterOffset = parseInt(format(toZonedTime(new Date(utcDate.getFullYear(), 0, 1), timezone), 'XXX', { timeZone: timezone }).replace(':', '').replace('+', ''), 10) / 100;
    const isDST = offset !== winterOffset;

    const timezoneInfo: TimezoneInfo = {
      timezone,
      offset,
      isDST,
      localTime: localDate,
      utcTime: utcDate
    };

    return { utcDate, timezoneInfo };
  } catch (error) {
    console.error('Error converting to UTC:', error);
    throw new Error(`Failed to convert to UTC: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get timezone for a given latitude/longitude
 */
export function getTimezoneForLocation(
  latitude: number,
  longitude: number
): string {
  // This is a simplified approach - in production, you'd use a proper timezone API
  // For now, we'll use some common longitude-based approximations
  
  const longitudeNormalized = ((longitude + 180) % 360) - 180;
  const utcOffset = Math.round(longitudeNormalized / 15);
  
  // Map common UTC offsets to timezone names
  const timezoneMap: { [key: number]: string } = {
    '-12': 'Pacific/Kwajalein',
    '-11': 'Pacific/Midway',
    '-10': 'Pacific/Honolulu',
    '-9': 'America/Anchorage',
    '-8': 'America/Los_Angeles',
    '-7': 'America/Denver',
    '-6': 'America/Chicago',
    '-5': 'America/New_York',
    '-4': 'America/Halifax',
    '-3': 'America/Sao_Paulo',
    '-2': 'Atlantic/South_Georgia',
    '-1': 'Atlantic/Azores',
    '0': 'Europe/London',
    '1': 'Europe/Paris',
    '2': 'Europe/Berlin',
    '3': 'Europe/Moscow',
    '4': 'Asia/Dubai',
    '5': 'Asia/Karachi',
    '6': 'Asia/Dhaka',
    '7': 'Asia/Bangkok',
    '8': 'Asia/Shanghai',
    '9': 'Asia/Tokyo',
    '10': 'Australia/Sydney',
    '11': 'Pacific/Noumea',
    '12': 'Pacific/Auckland'
  };
  
  return timezoneMap[utcOffset.toString()] || 'UTC';
}

/**
 * Process birth data with timezone handling
 */
export function processBirthData(birthData: BirthData): {
  utcDate: Date;
  timezoneInfo: TimezoneInfo;
} {
  const { date, latitude, longitude, timezone } = birthData;
  
  // If timezone is provided, use it
  if (timezone) {
    return convertToUTC(date, timezone);
  }
  
  // Otherwise, estimate timezone from location
  const estimatedTimezone = getTimezoneForLocation(latitude, longitude);
  console.log(`[TIMEZONE] Estimated timezone for ${latitude}, ${longitude}: ${estimatedTimezone}`);
  
  return convertToUTC(date, estimatedTimezone);
}

/**
 * Validate timezone string
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    // Use Intl.DateTimeFormat to check if timezone is valid
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of common timezones
 */
export function getCommonTimezones(): Array<{ value: string; label: string; offset: string }> {
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Sao_Paulo',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'Asia/Dubai',
    'Asia/Karachi',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland'
  ];
  
  return timezones.map(tz => {
    try {
      const offset = format(new Date(), 'XXX', { timeZone: tz });
      return {
        value: tz,
        label: tz.replace(/_/g, ' '),
        offset
      };
    } catch {
      return {
        value: tz,
        label: tz.replace(/_/g, ' '),
        offset: ''
      };
    }
  }).sort((a, b) => a.offset.localeCompare(b.offset));
}

/**
 * Format timezone info for display
 */
export function formatTimezoneInfo(info: TimezoneInfo): string {
  const offsetStr = info.offset >= 0 ? `+${info.offset}` : `${info.offset}`;
  const dstStr = info.isDST ? ' (DST)' : '';
  return `${info.timezone} (UTC${offsetStr})${dstStr}`;
}
