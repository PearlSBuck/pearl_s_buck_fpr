<script lang="ts">
      import { onSubmit } from './login';

      let email = '';
      let password = '';
</script>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>

<div class="bg-[#F6F8FF] min-h-screen">
  <div class="bg-white h-16 flex items-center px-4 justify-center sm:justify-between">
  <img src="/logo.jpg" alt="Logo" class="h-12 w-12 lg:h-16 lg:w-16 md:h-14 md:w-14 sm:h-12 sm:w-12 lg:p-1.5 md:p-1.5 sm:p-0"/>
  <h1 class="text-black -ml-14 lg:text-4xl md:text-3xl sm:text-2xl font-bold text-center flex-1 hidden sm:block">
    Pearl S. Buck Foundation Philippines, Inc.
  </h1>
</div>

  <div class="bg-[#474C58] h-10"></div>
  <div class="relative container mx-auto px-4 lg:w-3xl md:w-2xl sm:w-xl">
    <div class="font-[Coda Caption] text-white font-bold lg:text-3xl md:text-2xl sm:text-xl bg-[#1A5A9E] flex justify-center items-center rounded-lg h-20 mt-16 relative z-10">
        Login
    </div>
    <div class="bg-white flex flex-col items-start rounded-lg h-100 -mt-4 relative z-0 shadow-2xl">
      <p class="m-4 mt-10 font-bold lg:text-xl md:text-lg sm:text-md">Username:</p>
      <input type="text" bind:value={email} class="ml-10 p-2 rounded-md lg:w-100 md:w-75 sm:w-50 bg-[#DDE1E6] border-0 shadow-lg" placeholder="Enter your email..." />
      <p class="m-4 mt-10 font-bold lg:text-xl md:text-lg sm:text-md">Password:</p>
      <input type="password" bind:value={password} class="ml-10 p-2 rounded-md lg:w-100 md:w-75 sm:w-50 bg-[#DDE1E6] border-0 shadow-lg" placeholder="Enter your password..." />
      <div class="w-full mt-10 flex justify-end">
        <button
          on:click={() => onSubmit(email, password)}
          class="bg-[#1A5A9E] text-white font-bold p-2 rounded-md lg:w-50 md:w-40 sm:w-30 mt-6 mr-10 shadow-lg hover:cursor-pointer"
        >
          Sign-in
        </button>
      </div>
    </div>
  </div>
</div>