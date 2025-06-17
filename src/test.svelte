<script lang="ts">
    import ScInformation from "./stories/SCInformation.svelte";
    import EducationBackground from "./stories/EducationBackground.svelte";
    import AddMember from "./stories/AddMember.svelte";
    import FamilyIncome from "./stories/FamilyIncome.svelte";
    import { onMount } from 'svelte';

    interface Props {
        formTitle: string;
    }
    // If you are using SvelteKit, props are passed differently; adjust as needed
    // const { formTitle = 'Family Progress Report'}: Props = $props();
    let formTitle: string = 'Family Progress Report';

    let offline = false;

    onMount(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data?.type === 'OFFLINE_DETECTED') {
                    offline = true;
                    console.log('App is offline. Service Worker sent event.');
                }
            });
        }
    });

    window.addEventListener('offline', () => {
        console.log('Browser is offline');
        offline = true;
    });

    window.addEventListener('online', () => {
        console.log('Back online');
        offline = false;
    });
</script>

<!-- {#if offline} -->
<!-- {/if} -->


<div class="bg-[#F6F8FF] top-0 left-0 absolute w-full">
    <p class="fixed align-top inset-x-0 top-0 bg-[#02A5EC] p-3 text-center text-white text-sm">Currently Offline</p>

    <div class="w-1/2 bg-white rounded-xl shadow-lg space-y-4 px-6 py-4 my-4 center place-self-center">
        <div class="text-3xl font-bold pb-4">{formTitle}</div> 
    </div>
    <ScInformation sectionTitle="Section Titssle" />
    <EducationBackground sectionTitle="Section Title"/>
    <AddMember familyMembers={[]} />
    <FamilyIncome sectionTitle="Section Title"/>
    
</div>
