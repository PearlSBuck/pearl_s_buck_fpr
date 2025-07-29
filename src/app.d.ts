// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { User } from "@supabase/supabase-js";

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: user | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
