<script>

	import { LayerCake, ScaledSvg, Html, uniques } from 'layercake';
	import { scaleBand } from 'd3-scale';
	
	import { Slider } from "carbon-components-svelte";
	import DualSlider from './utils/DualSlider.svelte';
	
	import Column from './components/Column.svelte'
	import Line from './components/Line.svelte';
	import Area from './components/Area.svelte';
	import AxisX from './components/AxisX.html.svelte';
	import AxisY from './components/AxisY.html.svelte';
	import SharedTooltip from './components/SharedTooltip.percent-range.svelte';
	
	import Minidays from './components/Minidays.svelte';
	
	let countries = ['Norway', 'Sweden', 'Germany', 'France', 'USA']
	
	let options = { day: 'numeric', month: 'numeric', year: '2-digit' }
	const formatTickX = d => new Date(d).toLocaleDateString('no-NO', options);
	const stroke = '#ffa600';
	const mainLineStrokeWidth = 5;
	const xTickColor = "#ffa600";
	const yTickColor = "#ffa600";
	const textHighlightColor = "#ffa600";
	const colCol = "#ccc"
	let charts = 3;
	
	export let data
	
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
	let range = 7;
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
	let starter = ((data.data.new.findIndex(n => n.new >0)-2)/data.data.new.length) // dynamic right before epidemic start
	let start = starter;
	let end = 1;
	
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
	$: shavedData = cutData(dataToShave, start, end)
	$: shavedMvAvg = cutData(MovingAverage, start, end)
		
	$: firstRepShort = shavedData[0].date.toLocaleDateString('no-NO', options)
	$: lastRepShort = shavedData[shavedData.length-1].date.toLocaleDateString('no-NO', options)

	
	$: mvUniqueDates = uniques(shavedData, "date")
	$: lineUniqueDates = uniques(shavedMvAvg, "date")
	$: max = Math.max.apply(Math, shavedData.map(function(o) { return o.new; }))
	
	// https://stackoverflow.com/questions/33268863/find-last-matching-object-in-array-of-objects/49199917#49199917
	let currAvgIndex
	$: currAvgIndex = shavedData.map(d => d.avg !== undefined).lastIndexOf(true)
	
	$: currAvg = currAvgIndex > 0 ? shavedData[currAvgIndex].avg : false

</script>
<article class="text">
	<h2>
		{#if range>1}
			Gjennomsnitt diagnoser siste {range}-dagers-periode: 
		{:else}
			Diagnoser siste dag:
		{/if}
		{#if currAvg}
			{#if range>1}
				<span style="color: {textHighlightColor}">
					{currAvg}
				</span>
			{:else}
				{currAvg}
			{/if}
		{:else} 
			Ikke noe gjennomsnitt for valgt periode.
		{/if}
	</h2>
	<p>
		<span>
			{#if range>1}
				<span style="color: {textHighlightColor}">
					Glidende gjennomsnitt</span> over {range} dager.
			{:else}
				Alle tall mellom {firstRepShort} og {lastRepShort}.
			{/if} 
		</span>
	</p>
</article>
<article class="controls">
	<Slider
	labelText="Endre periode for glidende gjennomsnitt:"
	min={1}
	max={60}
	bind:value={range}
	hideTextInput={true}
	inputType="number"
	/> 
	<div class="radios">
		<label for="radio">Vis: </label>
		<div id="radio">
		<label>
			<input type=radio bind:group={charts} value={3}>
			Begge
		</label>
		<label>
			<input type=radio bind:group={charts} value={2}>
			Kun dagvis
		</label>
		<label>
			<input type=radio bind:group={charts} value={1}>
			Kun glidende gjennomsnitt
		</label>
		</div>
	</div>
</article>

<section>
	<article class="chart">
		<div class="chart-container">
				{#if charts >= 2}
				<LayerCake
					percentRange={true}
					position='absolute'
					x='date'
					y='new'
					xDomain={mvUniqueDates}
					xScale={scaleBand()}
					data={shavedData}
					yDomain={[0, max]}
				>
					<ScaledSvg>
						<Column
							stroke={stroke}
							fill={colCol}
						/>
					</ScaledSvg>
					<Html>
						<AxisX
							gridlines={false}
							formatTick={formatTickX}
							snapTicks={true}
							ticks={[
								mvUniqueDates[0], 
								mvUniqueDates[Math.round((25/100)*mvUniqueDates.length)], 
								mvUniqueDates[Math.round(mvUniqueDates.length/2)], 
								mvUniqueDates[Math.round((75/100)*mvUniqueDates.length)], 
								mvUniqueDates[mvUniqueDates.length - 1]
							]}
							{xTickColor}
						/>
						<AxisY 
							ticks={4}
							gridlines={true}
							{yTickColor}
						/>
					</Html>
					{#if charts==2}
					<Html>
						<SharedTooltip
							formatTitle={formatTickX}
							dataset={shavedData}
						/>
					</Html>
					{/if}
				</LayerCake>
				{/if}
				{#if charts == 3 || charts == 1}
				
				{#if charts === 1}
				<LayerCake
					percentRange={true}
					position='absolute'
					x='date'
					y='avg'
					data={shavedMvAvg}
					yDomain={[0, Math.max.apply(Math, shavedMvAvg.map(function(o) { return o.avg; }))]}
					xDomain={lineUniqueDates}
					xScale={scaleBand()}
				>
				<ScaledSvg>
					<Line
						stroke={stroke}
						strokeWidth={mainLineStrokeWidth}
					/>
					<Area
						fill={stroke}
					/>
				</ScaledSvg>
				<Html>
				<AxisX
					gridlines={false}
					formatTick={formatTickX}
					ticks={[
					lineUniqueDates[0], 
					lineUniqueDates[Math.round((25/100)*lineUniqueDates.length)], 
					lineUniqueDates[Math.round(lineUniqueDates.length/2)], 
					lineUniqueDates[Math.round((75/100)*lineUniqueDates.length)], 
					lineUniqueDates[lineUniqueDates.length - 1]
					]}
					{xTickColor}
				/>
					<AxisY 
						ticks={4}
						gridlines={true}
						{yTickColor}
					/>
				</Html>
				<Html>
					<SharedTooltip
						formatTitle={formatTickX}
						dataset={shavedMvAvg}
					/>
				</Html>
				</LayerCake>
				{:else}
				<LayerCake
					percentRange={true}
					position='absolute'
					x='date'
					y='avg'
					data={shavedData}
					yDomain={[0, Math.max.apply(Math, shavedData.map(function(o) { return o.new; }))]}
					xDomain={mvUniqueDates}
					xScale={scaleBand()}
				>

				<ScaledSvg>
					<Line
						stroke={stroke}
						strokeWidth={mainLineStrokeWidth}
					/>
				</ScaledSvg>
				<Html>
				<AxisX
					gridlines={false}
					formatTick={formatTickX}
					ticks={[
					mvUniqueDates[0], 
					mvUniqueDates[Math.round((25/100)*mvUniqueDates.length)], 
					mvUniqueDates[Math.round(mvUniqueDates.length/2)], 
					mvUniqueDates[Math.round((75/100)*mvUniqueDates.length)], 
					mvUniqueDates[mvUniqueDates.length - 1]
					]}
					{xTickColor}
				/>
					<AxisY 
						ticks={0}
						gridlines={false}
						{yTickColor}
					/>
				</Html>
				<Html>
					<SharedTooltip
						formatTitle={formatTickX}
						dataset={shavedData}
					/>
				</Html>
				</LayerCake>
				{/if}
			{/if}
			</div>
	</article>
	<article class="controls-doubleslide">
		<p><span>{firstRepShort}</span></p>
		<div class="doubleslide">
			<DualSlider 
			bind:start
			bind:end
			/>
		</div>
		<p><span>{lastRepShort}</span></p>
	</article>

</section>
<article class="text" style="padding-top:1.5rem"><p>Nylig data for utvalgte land. Tallet er siste periode av glidende gjennomsnitt delt på befolkning.</p></article>
<section class="minidays">
{#each countries as country}
	<Minidays {range} {start} {end} {country} />
{/each}
</section>
<style lang="scss">
	.chart {
		position: relative;
	}
	.chart-container {
		position: relative;
		width: 100%;
		height: 100%;
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
	.controls .radios {
		margin-top: 1rem;
		font-size: .8rem;
		label {
			display: inline-block;
			margin-right: .5rem;
		}
	}
</style>


