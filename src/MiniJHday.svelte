<script>
	import { onMount } from 'svelte';
	import { minidayStore, minidaySettings, minidayCopy} from './store.js';
	import Minidays from './components/Minidays.svelte';
	import { uniqueByKeepLast } from './utils/functions.js'

	
	import CountryMultiselect from './components/CountryMultiselect.svelte'

	import Select from 'svelte-select'
	import { countries as items, regions } from './utils/searchcountries.js'
	import norskeRegioner from './data/countries/no_regions.json'
	export let mainSelection;

	let selectedValue = [];

	export let highlightColor;	
	export let range = 7;
	export let start = 0;
	export let end = 1;
	
	let subregions = false;

	let skala = 3
	const skalaSelect = [
		{ label: "Individuell absolutt skala", value: 1 },
		{ label: "Delt absolutt skala", value: 2 },
		{ label: "Delt relativ skala (per million)", value: 3 },
	]
	let maximum
	let pMmax
	
	$: maximum = Object.values($minidayStore).map(v => v.aMax)
	$: pMmax = Object.values($minidayStore).map(v => v.pMmax)
	
	// $: console.log(maximum, pMmax)
	
	// $: maximum = $minidayStore[0] != undefined ? Object.values($minidayStore).forEach(v => v.aMax) : undefined
	// $: pMmax = $minidayStore[0] != undefined ? Object.values($minidayStore).forEach(v => v.pMmax) : undefined
	
	
	$: $minidaySettings.aMax = maximum[0] != undefined ? Math.max.apply(Math, maximum) : undefined
	$: $minidaySettings.pMax = pMmax[0] != undefined ? Math.max.apply(Math, pMmax) : undefined
	$: $minidaySettings.skala = skala
	$: $minidaySettings.navnOversatt = true
	
	// $: Object.entries($minidayStore).forEach(([key, value]) => console.log(`${key}: ${value}`))
	// $: console.log(Object.values($minidayStore).forEach(v => v.aMax))

	
	let defaults = [{label: "Norge", value: "nor"}, {label: "Storbritannia", value: "gbr"}, {label: "USA", value: "usa"}, {label: "Tyskland", value: "deu"}, {label: "Frankrike", value: "fra"}]
	
	// $: console.log(JSON.stringify(uniqueByKeepLast(defaults, it => it.value)))

	onMount(()=>{
		selectedValue.push(...defaults)
	})
	
	const oversettelse = function(region, sub) {
		return sub ? norskeRegioner.subregions.filter(i => i.subregion === region) : norskeRegioner.regions.filter(i => i.region === region)
	}
	// console.log(oversettelse("South America", true))

	
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
	
	
	const activeClFilter = function (region, sub) {
		let result = regions.data.filter(obj => {
			if (sub) {
				return obj.subregion === region
			}
			return obj.region === region
		})
		// console.log(result === selectedValue)
		return result === selectedValue
	}	
	
	const selectRegion = function (region, sub) {
		let result = regions.data.filter(obj => {
			if (sub) {
				return obj.subregion === region
			}
			return obj.region === region
		})
		selectedValue = []
		selectedValue = result
	}


</script>



<article class="text">
	<h2 style="margin:0;padding:0;">Sammenlign land</h2>
	{#if selectedValue}
		<p><span>Definer tidsramme og periode for glidende gjennomsnitt med kontrollene over.</span></p>
		<label for="skala">Skala: 
			<select id="skala" bind:value={skala}>
				{#each skalaSelect as {label, value}}
					<option value={value}>{label}</option>
				{/each}
			</select>
		</label>
		<label>Oversatt navn: <input type="checkbox" bind:checked={$minidaySettings.navnOversatt}></label>
		<div class="selectregions">
			Velg en region:
			{#each regions.meta.regions as region} 
			<a class:active={(activeClFilter(region, false))} on:click={() => selectRegion(region, false)}>
				{oversettelse(region, false)[0].norsk}
			</a>
			{/each}
			eller legg til/fjern land selv i boksen under grafene. <br>
			{#if !subregions}
			<a on:click={() => subregions = !subregions }>Vis subregioner</a>
		{/if}
		{#if subregions}
		Velg en underregion:
			{#each regions.meta.subregions as region} 
				<a class:active={(activeClFilter(region, true))} on:click={() => selectRegion(region, true)}>
					{oversettelse(region, true)[0].norsk}
					<!-- {region} -->
				</a>
			{/each}
			<a on:click={() => subregions = !subregions }>X</a>
		{/if}
		</div>

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
	<div class="selectregions">

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

.selectregions {
	font-size: .8rem;
	margin-top: .5rem;
}

a {
	margin-right: .3rem;
	margin-bottom: .3rem;
	display: inline-block;
	padding: .3rem;
	cursor: pointer;
	background: #333;
	color: ghostwhite;
	border-radius: 3px;
}
a:hover {
	background: #ffa600;
	text-decoration: none;
}
a.active {
	background: ghostwhite;
	color: black;
}
	
</style>