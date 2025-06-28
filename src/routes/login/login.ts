import { supabase } from "../../lib/db.ts";
// import { redirect } from "@sveltejs/kit";
import { goto } from "$app/navigation"; // Use $app/navigation for navigation in SvelteKit

export async function handleSignIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in:", error);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function handleSignUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  }); // sign up method that was already in library

  if (error) {
    console.error("Error signing up:", error);
  }

  return data.user;
}

export async function onSubmit(email: string, password: string) {
  const result = await handleSignIn(email, password);
  if (result && result.user) {
    goto("/home");
  } else {
    alert("Sign-in failed. Please check your credentials.");
  }
}
