export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          birth_date: string | null
          birth_time: string | null
          birth_location: string | null
          time_unknown: boolean
          mbti: string | null
          zodiac_sign: string | null
          rising_sign: string | null
          moon_sign: string | null
          life_path_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          user_id: string
          name?: string | null
          birth_date?: string | null
          birth_time?: string | null
          birth_location?: string | null
          time_unknown?: boolean
          mbti?: string | null
          zodiac_sign?: string | null
          rising_sign?: string | null
          moon_sign?: string | null
          life_path_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          name?: string | null
          birth_date?: string | null
          birth_time?: string | null
          birth_location?: string | null
          time_unknown?: boolean
          mbti?: string | null
          zodiac_sign?: string | null
          rising_sign?: string | null
          moon_sign?: string | null
          life_path_number?: string | null
          updated_at?: string
        }
      }
      [key: string]: {
        Row: { [key: string]: any }
        Insert: { [key: string]: any }
        Update: { [key: string]: any }
      }
    }
    Views: {
      [key: string]: {
        Row: { [key: string]: any }
      }
    }
    Functions: {
      [key: string]: {
        Args: { [key: string]: any }
        Returns: any
      }
    }
    Enums: {
      [key: string]: string[]
    }
  }
}
