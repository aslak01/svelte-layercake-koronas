<script>
	import no from './data/countries/countries_no.json';
	import de from './data/countries/countries_de.json';
	import fr from './data/countries/countries_fr.json';
	import en from './data/countries/countries_en.json';
	
	import AutoComplete from "simple-svelte-autocomplete";
	
	
	
	// https://gist.github.com/yesvods/51af798dd1e7058625f4#gistcomment-2365119
	let concatAndDeDuplicateObjects = (p, ...arrs) => [].concat(...arrs).reduce((a, b) => !a.filter(c => b[p] === c[p]).length ? [...a, b] : a, []);
	
	const countries = concatAndDeDuplicateObjects('name', no, de, fr, en)
	
	// console.log(countries)
	
	export let selectedCountry;
	// $: console.log(selectedCountry)
	
</script>

<article class="controls">
	<AutoComplete items={countries} bind:selectedItem={selectedCountry} labelFieldName="name" />
</article>