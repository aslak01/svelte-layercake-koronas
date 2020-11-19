<script>
	// MINIDAYS

	import { LayerCake, ScaledSvg, Html, uniques, calcExtents } from 'layercake';
	import { scaleBand } from 'd3-scale';
	import { getData } from './utils/fetch.js';
	
	import Line from './components/Line.svelte';
	import Area from './components/Area.svelte';
	import AxisX from './components/AxisX.html.svelte';
	import AxisY from './components/AxisY.html.svelte';
	
	export let country = 'nor';
	let countryData = getData('https://restcountries.eu/rest/v2/alpha/' + country)

	const strokeWidth = 1
	
	export let data
	export let range = 7;
	export let start = 0;
	export let end = 1;
	export let highlightColor;

	const stroke = highlightColor;
	
	// moving average:
	// https://stackoverflow.com/questions/60211628/moving-average-of-time-series-objects-in-array	
	
	
	const sortDates = (data) => data.sort((a, b) => new Date(a.date) - new Date (b.date));
	const getAverage = (data) => data.reduce((acc, val) => acc + val.new, 0) / data.length;
	
	$: computeMovingAverage = (data, period) => {
		const movingAverages = [];
		const sortedData = sortDates(data);

		if (period > sortedData.length) { return getAverage(data); }
		for (let x = 0; x + period - 1 < sortedData.length; x += 1) {
			if (period > 1) {
				movingAverages.push({
					avg: Math.round(getAverage(sortedData.slice(x, x + period))),
					date: sortedData.slice(x, x + period)[Math.round(period/2)].date	// Middle
					// date: sortedData.slice(x, x + period)[period-1].date						// End
				})
			} else {
				movingAverages.push({
					avg: getAverage(sortedData.slice(x, x + period)),	
					date: sortedData.slice(x, x + period)[0].date	
				})
			}
		}
		return movingAverages;
	}
	let MovingAverage;
	$: MovingAverage = computeMovingAverage(data.data.new, range);

	// merge avgs back into data
	// https://stackoverflow.com/questions/46849286/merge-two-array-of-objects-based-on-a-key-
	
	const mergeByDate = (a1, a2) =>
	a1.map(itm => ({
			...a2.find((item) => (item.date === itm.date) && item),
			...itm
	}));

	$: dataToShave = mergeByDate(data.data.new, MovingAverage)
		
	
	// Data cutter
	// let starter = ((data.data.new.findIndex(n => n.new >0)-2)/data.data.new.length) // dynamic right before epidemic start
	
	let cutData = (data, x, y) => {
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
	let shavedData
	$: shavedData = cutData(MovingAverage, start, end)

	
	$: mvUniqueDates = uniques(shavedData, "date")
	$: extents = calcExtents(shavedData,
		 [{field: 'y', accessor: d => Math.max(d.new) }]
		)
	$: max = Math.max.apply(Math, shavedData.map(d => d.avg ))
	// https://stackoverflow.com/questions/33268863/find-last-matching-object-in-array-of-objects/49199917#49199917
	
	let currAvgIndex
	$: currAvgIndex = shavedData.map(d => d.avg !== undefined).lastIndexOf(true)
	
	$: currAvg = currAvgIndex > 0 ? shavedData[currAvgIndex].avg : false

	let insidens = function (avg, pop) {
		return Number.parseFloat(((avg / pop)).toPrecision(3)*1000000).toFixed()
	}


</script>

	<article class="enhet">
		{#await data}...
		{:then data}
			{#await $countryData}...
			{:then cData}
			<h3 class="name">{cData.nativeName}</h3>
			<span class="insidens">{insidens(currAvg, cData.population)}</span>
			{/await}
			<div class="chart">
				<div class="chart-container">
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
					<Html>
					<AxisX
						gridlines={false}
						ticks={false}
					/>
						<AxisY 
							ticks={0}
							gridlines={false}
						/>
					</Html>
					</LayerCake>
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
	}
	.chart-container {
		position: relative;
		width: 100%;
		height: 100%;
	}
	.name {
		display: block;
		font-size: clamp(.8rem, 1vw, 1.2rem);
		margin: 0;
		white-space: nowrap;
	}
</style>
