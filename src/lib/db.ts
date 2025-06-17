import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (!process.env.POSTGRES_URL) console.error("Postgres URL not found");

const pgSingleton = () => {
  return new Pool({
    connectionString: import.meta.env.POSTGRES_URL,
  });
};

declare const globalThis: {
  pgGlobal: ReturnType<typeof pgSingleton>;
} & typeof global;

const pgDb: Pool = globalThis.pgGlobal ?? pgSingleton();

export default pgDb;
