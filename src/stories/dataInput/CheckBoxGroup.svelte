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
    value = '',
    options = [],
    required = false
  }: Props = $props();
</script>

<div class="mb-4">
  <p class="block text-sm font-medium mb-1">{label}</p>
  <div class="space-y-2 ml-2">
    {#each options as option}
      <label class="flex items-center space-x-2">
        <input
          type="checkbox"
          name={name}
          bind:group={value}
          value={option.value}
          required={required}
        />
        <span>{option.label}</span>
      </label>
    {/each}
  </div>
</div>

