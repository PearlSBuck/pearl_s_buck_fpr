<script lang="ts">
     interface Option {
    label?: string;
    value?: string;
  }

  interface Props {
    label?: string;
    name?: string;
    value?: string;
    options?: Option[];
    required?: boolean;
  }

  let {
    label = '',
    name = '',
    value =  $bindable(),
    options = [],
    required = false
  }: Props = $props();
</script>

<div>
  <label for={name} class="block text-sm font-medium mb-1">{label}</label>

    <select class="mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm" required={required} name={name} bind:value>
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
    </select>
</div>
