<script>
	// import AutoComplete from "simple-svelte-autocomplete";
	import Select from 'svelte-select'
	
	import {countries as items} from './utils/searchcountries.js'
	
	let startValue = {label: "Norge", value: "nor"};
	
	export let selectedValue = {label: "Norge", value: "nor"};
	
	$: console.log(selectedValue)
	
</script>
<style>
	.themed {
		--itemColor: #333;
		--itemIsActiveColor: #333;
		color: #333;
		width: 20%;
		min-width: 300px;
		max-width: 500px;
		display: inline-block;
	}
	
</style>
<div class="themed">
	<Select
		{items}
		bind:selectedValue
		isClearable='false'
	></Select>
</div>