import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for Supabase tables
export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      pp_procedures_and_payments: {
        Row: {
          id: string;
          patient_id: string;
          procedure_name: string;
          date: string;
          doctor_id: string;
          price: number;
          paid: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          procedure_name: string;
          date: string;
          doctor_id: string;
          price: number;
          paid: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          procedure_name?: string;
          date?: string;
          doctor_id?: string;
          price?: number;
          paid?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      pp_notes: {
        Row: {
          id: string;
          patient_id: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      doctors: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
