<!-- 
    This route creates a basic page as an example
-->

<script lang="ts">
  import Header from '../../components/Header.svelte'; // adjust the path as needed
  import Year from '../../components/Year.svelte'; // adjust the path as needed

  let pageName = "rinaldo baldcado";
  let innerText = "Year: 2023";
  let selected: 'progress_report' | 'intro_sheet' = 'progress_report';
</script>
<Header name={pageName} search backButton />;
<div class="mt-100 mx-10">
  <Year innerText={innerText} activated={true} />
</div>



    