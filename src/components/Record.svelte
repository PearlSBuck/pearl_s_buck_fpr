<script lang="ts">
    export let name: string = '';
    export let id_number: string = '';
    export let selectRecord: boolean = false;
</script>

<div class="flex justify-between rounded-md text-white bg-[#474C58] h-16 p-3 w-60 m-1 lg:w-275 md:w-150 sm:w-125 relative">
    <div class="flex items-start flex-col justify-center">
        <div class="flex flex-col justify-center items-start gap-1">
            <span>SC Name: {name}</span>
            <span>SC Number: {id_number}</span>
        </div>
    </div>
    <div class="top-1 right-2">
        {#if selectRecord}
          <input type="checkbox" class="form-checkbox text-gray-600 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-gray-500 mt-2">
        {/if}
    </div>
</div>
