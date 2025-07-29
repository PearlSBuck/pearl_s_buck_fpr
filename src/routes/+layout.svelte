<script lang="ts">
  import { setContext } from "svelte";
  import "../app.css";
  import Header from "../components/Header.svelte";
  let pageName = $state("");
  let search = $state(false);
  let backButton = $state(false);
  setContext("setPageName", setPageContext);
  function setPageContext(name: string, isSearch: boolean, isBack: boolean) {
    pageName = name;
    search = isSearch;
    backButton = isBack;
  }

  let { children } = $props();
</script>

<Header name={pageName} {search} {backButton} />
{@render children()}
