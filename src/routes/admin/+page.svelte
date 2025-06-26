<!-- 
    This route creates a basic page as an example
-->

<script lang="ts">
  import Header from '../../components/Header.svelte'; // adjust the path as needed

  let pageName = "clive";
  let selected: 'progress_report' | 'intro_sheet' = 'progress_report';
</script>
<Header name={pageName} />;
