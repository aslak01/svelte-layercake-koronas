<script>
	import { onMount } from 'svelte';
	import { minidayStore, minidaySettings, minidayCopy} from './store.js';
	import Minidays from './components/Minidays.svelte';
	
	import CountryMultiselect from './components/CountryMultiselect.svelte'

	import Select from 'svelte-select'
	import { countries as items } from './utils/searchcountries.js'
	
	export let mainSelection;

	let selectedValue = [];

	export let highlightColor;	
	export let range = 7;
	export let start = 0;
	export let end = 1;

	let skala = 1
	const skalaSelect = [
		{ label: "Individuell absolutt skala", value: 1 },
		{ label: "Delt absolutt skala", value: 2 },
		{ label: "Delt relativ skala (per million)", value: 3 },
	]
	let maximum
	let pMmax
	
	$: maximum = $minidayStore.map(x => x.aMax)
	$: pMmax = $minidayStore.map(x => x.pMmax)
	
	$: $minidaySettings.aMax = maximum[0] != undefined ? Math.max.apply(Math, maximum) : undefined
	$: $minidaySettings.pMax = pMmax[0] != undefined ? Math.max.apply(Math, pMmax) : undefined
	$: $minidaySettings.skala = skala
	


	onMount(()=>{
		selectedValue.push(mainSelection, {label: "Sverige", value: "swe"}, {label: "Russland", value: "rus"}, {label: "Frankrike", value: "fra"}, {label: "USA", value: "usa"}, {label: "Iran", value: "irn"})
	})
	
	function handleSelection(event) {
		console.log('selection:', event.detail)
		console.log('#each array', selectedValue)
	}
	const uniqByProp_map = prop => arr =>
	Array.from(
		arr
			.reduce(
				(acc, item) => (
					item && item[prop] && acc.set(item[prop], item),
					acc
				), // using map (preserves ordering)
				new Map()
			)
			.values()
	);
	const uniqueById = uniqByProp_map("id");
	
	
	let isSorted = false;
	let sorted
	// let seen = new Set();
	$: sorted = uniqueById($minidayCopy).sort((a, b) => (b?.pMmax || 0) - (a?.pMmax || 0))
	// filter(el => {
	// const duplicate = seen.has(el.id);
	// seen.add(el.id);
	// return !duplicate;
	// }).slice()
	
	$: console.log("sorted", sorted)
</script>



<article class="text">
	<h2 style="margin:0;padding:0;">Sammenlignet med andre land</h2>
	{#if selectedValue}
		<p><span>Tallet under landets navn er tilfeller per million innbyggere i den siste perioden glidende gjennomsnitt (definert ovenfor).</span></p>
		<label for="skala">Skala: 
			<select id="skala" bind:value={skala}>
				{#each skalaSelect as {label, value}}
					<option value={value}>{label}</option>
				{/each}
			</select>
		</label>
		<!-- broken: -->		
		<!-- <label>Sortert: <input type="checkbox" bind:checked={isSorted}></label> -->
	{/if}
</article>

{#if selectedValue}
	<section class="minidays">
		{#each selectedValue as country, index (country.value)}
			<Minidays {range} {start} {end} country={country.value} {highlightColor} {index} />
		{/each}
	</section>
{/if}


{#if isSorted}
<section class="minidays">
{#each sorted as country, index (country.pMmax)}
<Minidays {range} {start} {end} country={country.id} {highlightColor} {index} />
{/each}
</section>
{/if}

<!-- debug buttons -->
<!-- <button on:click={console.log($minidayStore)}>MinidayStore</button>
<button on:click={console.log($minidaySettings)}>minidaySettings</button> -->

<article class="text" style="padding-top:1.5rem">
	<p><span>Legg til eller fjern land, du kan søke etter land på norsk, engelsk, tysk og fransk.</span></p>
	<div class="themed">
		<Select
			{items}
			bind:selectedValue
			isMulti={true}
			listPlacement='bottom'
		></Select>
	</div>
</article>

<style>
	label {
		font-size: .8rem;
	}
.themed {
	--itemColor: #333;
	--itemIsActiveColor: #333;
	color: #333;
	--inputColor: white;
	--background: transparent;
}
.minidays {
	display: flex;
	/* align-items: center; */
	height: 100%;
	width: 100%;
	flex-flow: row wrap;
	flex-wrap: wrap;
	justify-items: space-evenly safe;
	padding: 1rem 0;
}

	
</style>