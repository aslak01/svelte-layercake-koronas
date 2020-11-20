<script>
	// MINIDAYS

	import { LayerCake, ScaledSvg, uniques } from 'layercake';
	import { scaleBand } from 'd3-scale';
	
	import Line from './components/Line.svelte';
	import Area from './components/Area.svelte';	
	
	
	export let data
	export let cData
	export let country
	export let range = 7;
	export let start = 0;
	export let end = 1;
	export let highlightColor;
	
	export let maximum
	export let sharedMax
	export let pMsharedMax
	export let skala = 1
	export let pMmax
	
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
	
	const sortDates = (data) => data.sort((a, b) => new Date(a[xKey]) - new Date (b[xKey]));
	const getAverage = (data) => data.reduce((acc, val) => acc + val[avgKey], 0) / data.length;
	
	const computeMovingAverage = (data, period) => {
		const movingAverages = [];
		const sortedData = sortDates(data);

		if (period > sortedData.length) { return getAverage(data); }
		for (let x = 0; x + period - 1 < sortedData.length; x += 1) {
			if (period > 1) {
				movingAverages.push({
					avg: Math.round(getAverage(sortedData.slice(x, x + period))),
					date: sortedData.slice(x, x + period)[Math.round(period/2)][xKey],
					pmil: insidens(getAverage(sortedData.slice(x, x + period)), population)
				})
			} else {
				movingAverages.push({
					avg: getAverage(sortedData.slice(x, x + period)),	
					date: sortedData.slice(x, x + period)[0][xKey],
					pmil: insidens(getAverage(sortedData.slice(x, x + period)), population)
				})
			}
		}
		return movingAverages;
	}
		
	const cutData = (data) => {
		let firstSlice = Math.round(start * data.length)
		let lastSlice = Math.round(end* data.length)
		if (lastSlice-firstSlice>=2) {
			return data.slice(firstSlice, lastSlice)
		} else if (lastSlice < 2) {
			return data.slice(firstSlice, lastSlice+2)
		} else if (firstSlice-data.length < 1) {
			return data.slice(firstSlice-2, lastSlice)
		}
	}
	
	const insidens = function (avg, pop) {
		return Number.parseFloat(((avg / pop)).toPrecision(3)*1000000).toFixed()
	}
	
	let population
	$: population = cData.population
	
	$: MovingAverage = computeMovingAverage(data.data.new, range);
	$: shavedData = cutData(MovingAverage, start, end)
	$: currAvgIndex = shavedData.map(d => d[yKey] !== undefined).lastIndexOf(true)
	$: currAvg = currAvgIndex > 0 ? shavedData[currAvgIndex][yKey] : false
	
	$: max = Math.max.apply(Math, shavedData.map(d => d[yKey]))
	$: maximum = max
	
	$: pMmax = Math.max.apply(Math, shavedData.map(d => d[pMilKey]))
	

	
	$: mvUniqueDates = uniques(shavedData, xKey)

	
	
	
</script>

	<article class="enhet">
		{#await data}...
		{:then data}
			{#await cData}...
			{:then cData}
			<div class="text">
				<h3 class="name">{cData.nativeName}</h3>
				<span class="insidens">{insidens(currAvg, population)}</span>
			</div>
			{/await}
			<div class="chart">
				<div class="chart-container">
					{#if skala == 1}
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
				{:else if skala == 2}
				<LayerCake
				percentRange={true}
				x={xKey}
				y={yKey}
				data={shavedData}
				yDomain={[0, sharedMax]}
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
					data={shavedData}
					yDomain={[0, pMsharedMax]}
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
		{/await}
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
