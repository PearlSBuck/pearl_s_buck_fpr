<svelte:head>
  <script src="https://accounts.google.com/gsi/client" async></script>
</svelte:head>

<script lang="ts">
      import './login.css';
      import { onSubmit, handleSignUp } from './login';
      import { supabase } from "../../lib/db";

      let email = '';
      let password = '';
      let newEmail = '';
      let newPassword = '';

  async function handleSignInWithGoogle(response) {
  try {
    // Attempt to sign in with Google token
    const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: response.credential,
    });

    if (authError) throw authError;

    //Extract the user's email from the JWT
    const decodedJwt = parseJwt(response.credential);
    const userEmail = decodedJwt.email;

    if (!userEmail) throw new Error("No email found in Google token.");

    //Insert the user in the "users" table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert(
        {
          email: userEmail,
          last_login_at: new Date().toISOString(),
        },
        { onConflict: "email" } 
      )
      .select();

    if (userError) throw userError;

    console.log("User logged in and stored:", userData);
  } catch (error) {
    console.error("Error during Google sign-in:", error);
  }
}

// Function to decode JWT
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode JWT:", e);
    return {};
  }
}
</script>

<div class="central">
  <input type="text" bind:value={email} class="field" placeholder="Email..."/>
  <input type="password" bind:value={password} class="field" placeholder="Password..."/>
  <button type="submit" class="login-submit" on:click={() => onSubmit(email, password)}>Login</button>
</div>

<div class="central">
  <input type="text" bind:value={newEmail} class="field" placeholder="New Email..."/>
  <input type="password" bind:value={newPassword} class="field" placeholder="New Password..."/>
  <button type="submit" class="login-submit" on:click={() => handleSignUp(newEmail, newPassword)}>Sign Up</button>
</div>

<div id="g_id_onload"
     data-client_id="490000336368-3fg0brv9lgvsbe33tmft6mrk402dmc5u.apps.googleusercontent.com"
     data-context="signup"
     data-ux_mode="popup"
     data-login_uri="https://euwhpolzjpfuqncfjczc.supabase.co/auth/v1/callback"
     data-callback="handleSignInWithGoogle"
     data-auto_prompt="false">
</div>

<div class="g_id_signin"
     data-type="standard"
     data-shape="pill"
     data-theme="filled_blue"
     data-text="signin_with"
     data-size="large"
     data-logo_alignment="left">
</div>