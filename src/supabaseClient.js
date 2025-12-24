import { createClient } from "@supabase/supabase-js";

// GANTI DENGAN API KEYS ANDA DARI SUPABASE DASHBOARD
const supabaseUrl = "https://ubpuxlaytqwhlbuuysan.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVicHV4bGF5dHF3aGxidXV5c2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1Njg4NzYsImV4cCI6MjA4MjE0NDg3Nn0.UA7dq_g6epfUSRcXHXe7LOUp14EIJaWRuyEtm2AzrVY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
