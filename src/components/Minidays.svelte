<script>
import { getData2 } from '../utils/fetch1.js';
import ChDayMini from '../ChJH.miniday.svelte';

export let range = 7;
export let start = 0;
export let end = 1;
export let country;
export let highlightColor;
let req = getData2("https://disease.sh/v3/covid-19/historical/" + country + "?lastdays=all");

</script>


	{#await $req}...{:then data}
		<ChDayMini {range} {start} {end} {country} {data} {highlightColor} />
	{/await}
