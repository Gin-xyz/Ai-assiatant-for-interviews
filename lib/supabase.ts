import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          pin: string
          name: string
          interests: string
          created_at: string
          updated_at: string
        }
        Insert: {
          pin: string
          name: string
          interests: string
        }
        Update: {
          name?: string
          interests?: string
        }
      }
      interviews: {
        Row: {
          id: string
          user_id: string
          type: string
          company: string
          role: string
          score: number
          duration: number
          status: string
          questions_count: number
          topics: string[]
          feedback: string
          created_at: string
        }
        Insert: {
          user_id: string
          type: string
          company: string
          role: string
          score: number
          duration: number
          status: string
          questions_count: number
          topics: string[]
          feedback: string
        }
      }
      practice_problems: {
        Row: {
          id: string
          title: string
          description: string
          difficulty: string
          category: string
          company: string
          acceptance_rate: number
          tags: string[]
          time_complexity: string
          space_complexity: string
          starter_code: string
          test_cases: any
          solution: string
          explanation: string
          created_at: string
        }
      }
      user_solutions: {
        Row: {
          id: string
          user_id: string
          problem_id: string
          code: string
          language: string
          status: string
          score: number | null
          feedback: string | null
          execution_time: number | null
          created_at: string
        }
        Insert: {
          user_id: string
          problem_id: string
          code: string
          language?: string
          status: string
          score?: number
          feedback?: string
          execution_time?: number
        }
      }
    }
  }
}
