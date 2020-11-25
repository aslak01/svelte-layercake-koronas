<script>
	// MINIDAYS
	import { onMount, onDestroy } from 'svelte';
	import { minidayStore, minidaySettings } from './store.js';
	import { LayerCake, ScaledSvg, uniques } from 'layercake';
	import { scaleBand } from 'd3-scale';
	
	import { computeMovingAverage, cutData } from './utils/functions.js'

	
	import Line from './components/Line.svelte';
	import Area from './components/Area.svelte';	
	
	
	export let data
	export let cData
	export let country
	export let range = 7;
	export let start = 0;
	export let end = 1;
	export let highlightColor;
	export let index;
	// console.log(index)
		
	let max
	let shavedData
	let currAvgIndex
	let MovingAverage;

	let avgKey = 'new'
	let yKey = 'avg'
	let xKey = 'date'
	let pMilKey = 'pmil'

	const strokeWidth = 1
	const stroke = highlightColor;
		
	
	const insidens = function (avg, pop) {
		return Number.parseFloat(((avg / pop)).toPrecision(3)*1000000).toFixed()
	}
	
	let population
	$: population = cData.population
	
	$: MovingAverage = computeMovingAverage(data.data.new, range, xKey, avgKey, yKey);
	$: shavedData = cutData(MovingAverage, start, end)
	$: currAvgIndex = shavedData.map(d => d[yKey] !== undefined).lastIndexOf(true)
	$: currAvg = currAvgIndex > 0 ? shavedData[currAvgIndex][yKey] : false
	
	$: max = Math.max.apply(Math, shavedData.map(d => d[yKey]))
	
	$: updShv = shavedData.map(v => ({
		...v, pmil: insidens(v[yKey], population)
		}))
	// $: console.log(updShv)
	
	$: pMmax = Math.max.apply(Math, shavedData.map(d => insidens(d[yKey], population)))
	// $: console.log(shavedData.map(d => insidens(d[yKey], population)))
	// $: pMmax.map(i => shavedData.map(v => ({...v, i}) ))
	
	// $: console.log(shavedData)
	
	$: mvUniqueDates = uniques(shavedData, xKey)

	onMount( () => {
		$minidayStore = [...$minidayStore, {id: country, aMax: max, pMmax: pMmax}]
	})
	onDestroy( () => {
		console.log('Fjerna ', country)
		$minidayStore = $minidayStore.filter((n) => {return n.id != country})
	})
	
</script>

	<article class="enhet">
			<div class="text">
				<h3 class="name">{cData.nativeName}</h3>
				<span class="insidens">{insidens(currAvg, population)}</span>
			</div>
			<div class="chart">
				<div class="chart-container">
					{#if $minidaySettings.skala == 1}
					<LayerCake
					percentRange={true}
					x='date'
					y='avg'
					data={shavedData}
					yDomain={[0, max]}
					xDomain={mvUniqueDates}
					xScale={scaleBand()}
				>
				<ScaledSvg>
					<Line
						{stroke}
						{strokeWidth}
					/>
					<Area 
						fill={stroke}
					/>
				</ScaledSvg>
				</LayerCake>
				{:else if $minidaySettings.skala == 2}
				<LayerCake
				percentRange={true}
				x={xKey}
				y={yKey}
				data={shavedData}
				yDomain={[0, $minidaySettings.aMax]}
				xDomain={mvUniqueDates}
				xScale={scaleBand()}
			>
			<ScaledSvg>
				<Line
					{stroke}
					{strokeWidth}
				/>
				<Area 
					fill={stroke}
				/>
			</ScaledSvg>
			</LayerCake>
			{:else}
					<LayerCake
					percentRange={true}
					x={xKey}
					y={pMilKey}
					data={updShv}
					yDomain={[0, $minidaySettings.pMax]}
					xDomain={mvUniqueDates}
					xScale={scaleBand()}
				>
				<ScaledSvg>
					<Line
						{stroke}
						{strokeWidth}
					/>
					<Area 
						fill={stroke}
					/>
				</ScaledSvg>
				</LayerCake>
				{/if}


				</div>
			</div>
	</article>

<style>
	.enhet {
		position: relative;
		width: 100px;
		height: 100px;
		margin: auto;
		justify-content: center;
	}
	.chart {
		position: relative;
		width: 100px;
		height: 60px;
		padding-top: 0;
		z-index: 10;
	}
	.chart-container {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.text {
		height: 30px;
		position: relative;
	}
	.name {
		position: absolute;
		top: 0;
		display: block;
		font-weight: normal;
		font-size: clamp(.8rem, 1%, 1.2rem);
		margin: 0;
		/* white-space: nowrap; */
	}
	.insidens {
		font-size: .7rem;
		position: absolute;
		top: .8rem;
		right: 0;
	}
</style>
