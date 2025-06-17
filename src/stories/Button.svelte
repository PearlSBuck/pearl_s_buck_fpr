<<<<<<< HEAD
<script>
  import './button.css';

  /**
   * @typedef {Object} Props
   * @property {boolean} [primary] Is this the principal call to action on the page?
   * @property {string} [backgroundColor] What background color to use
   * @property {'small' | 'medium' | 'large'} [size] How large should the button be?
   * @property {string} label Button contents
   * @property {() => void} [onclick] The onclick event handler
   */

  /** @type {Props} */
  const { primary = false, backgroundColor, size = 'medium', label, ...props } = $props();

  let mode = $derived(primary ? 'storybook-button--primary' : 'storybook-button--secondary');
  let style = $derived(backgroundColor ? `background-color: ${backgroundColor}` : '');
=======
<script lang="ts">
  import './button.css';

  interface Props {
    /** Is this the principal call to action on the page? */
    primary?: boolean;
    /** What background color to use */
    backgroundColor?: string;
    /** How large should the button be? */
    size?: 'small' | 'medium' | 'large';
    /** Button contents */
    label: string;
    /** The onclick event handler */
    onClick?: () => void;
  }
  
  const { primary = false, backgroundColor, size = 'medium', label, onClick }: Props = $props();
>>>>>>> 7a0a5279eaa12b34b04ed4968830cf37c82ca0ed
</script>

<button
  type="button"
<<<<<<< HEAD
  class={['storybook-button', `storybook-button--${size}`, mode].join(' ')}
  {style}
  {...props}
=======
  class={['storybook-button', `storybook-button--${size}`].join(' ')}
  class:storybook-button--primary={primary}
  class:storybook-button--secondary={!primary}
  style:background-color={backgroundColor}
  onclick={onClick}
>>>>>>> 7a0a5279eaa12b34b04ed4968830cf37c82ca0ed
>
  {label}
</button>
