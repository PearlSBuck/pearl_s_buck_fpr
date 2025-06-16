<script lang="ts">
    interface Props {
        label: string;
        value: string;
        name: string;
        placeholder: string;
        required: boolean;
    }

    let { 
        label = '', 
        value =  $bindable(),
        name = '', 
        placeholder = '', 
        required = false
    }: Props = $props();
</script>

<div class="mb-4">
  <label for={name} class="block text-sm font-medium mb-1">{label}</label>
  <input
    id={name}
    name={name}
    class="border-0 border-b-2 border-gray-300 focus:border-indigo-600 focus:outline-none p-2 w-full"
    type="text"
    bind:value 
    placeholder={placeholder}
    required={required}
  />
</div>
