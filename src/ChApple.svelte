<script>

	import Car32 from "carbon-icons-svelte/lib/Car32";
	import Bus32 from "carbon-icons-svelte/lib/Bus32";
	import Pedestrian32 from "carbon-icons-svelte/lib/Pedestrian32";
	import Close32 from "carbon-icons-svelte/lib/Close32";
	
	import { Slider } from "carbon-components-svelte";

	import { LayerCake, ScaledSvg, Html, uniques } from 'layercake';
	// import { timeParse } from 'd3-time-format';
	import { format, precisionFixed } from 'd3-format';
	import { scaleOrdinal } from 'd3-scale';

	import MultiLine from './components/MultiLine.svelte';
	import AxisX from './components/AxisX.html.svelte';
	import AxisY from './components/AxisY.html.svelte';
	import SharedTooltip from './components/SharedTooltip.percent-range.svelte';
	
	
	export let data

	data.data.forEach((e) => {
		delete e["sub-region"];
		delete e["subregion_and_city"];
		delete e["geo_type"];
	});
	
	let data2 = data.data;

	const sortDates = (data) => data.sort((a, b) => new Date(a.date) - new Date (b.date));
	const getAvgTrans = (data) => data.reduce((acc, val) => acc + val.transit, 0) / data.length;
	const getAvgDriv = (data) => data.reduce((acc, val) => acc + val.driving, 0) / data.length;
	const getAvgWalk = (data) => data.reduce((acc, val) => acc + val.walking, 0) / data.length;


	const movingAvgTooltip = (data, period) => {
		const movingAverages = [];
		const sortedData = sortDates(data);

		if (period > sortedData.length) { return getAverage(data); }
		for (let x = 0; x + period - 1 < sortedData.length; x += 1) {
			if (period > 1) {
				movingAverages.push({
					transit: Math.round(getAvgTrans(sortedData.slice(x, x + period))),
					driving: Math.round(getAvgDriv(sortedData.slice(x, x + period))),
					walking: Math.round(getAvgWalk(sortedData.slice(x, x + period))),
					date: sortedData.slice(x, x + period)[Math.round(period/2)].date	// Middle
					// date: sortedData.slice(x, x + period)[period-1].date						// End
				})
			} else {
				movingAverages.push({
					transit: Math.round(getAvgTrans(sortedData.slice(x, x + period))),
					driving: Math.round(getAvgDriv(sortedData.slice(x, x + period))),
					walking: Math.round(getAvgWalk(sortedData.slice(x, x + period))),
					date: sortedData.slice(x, x + period)[0].date	
				})
			}
		}
		return movingAverages;
	}
	
	
	const xKey = 'date';
	const yKey = 'value';
	const zKey = 'key';

	const xTickColor = "#fff";
	const yTickColor = "#ccc";


	const seriesNames = Object.keys(data2[0]).filter(d => d !== xKey);
	
	
	$: seriesColors = ['#2b8dcf', '#fa6eb8', "#ffa600"]
	
	const brightColors = ['#2b8dcf', '#fa6eb8', "#ffa600"]
	const mutedColors = ['#63344d', '#1a3248', '#443014']
	
	const brightCar = ['#2b8dcf', '#63344d', '#443014']
	const brightBus = ['#1a3248', '#fa6eb8', '#443014']
	const brightPed = ['#1a3248', '#63344d', "#ffa600"]
	
	const mutedCar = ['#63344d','#fa6eb8', "#ffa600"]
	const mutedBus = ['#2b8dcf','#1a3248', "#ffa600"]
	const mutedPed = ['#2b8dcf', '#fa6eb8', '#443014']
	
	// const parseDate = timeParse('%Y-%m-%d');
	
	const dataLong = seriesNames.map(key => {
		return {
			key,
			values: data2.map(d => {
				d[xKey] = typeof d[xKey] === 'string' ? new Date(d[xKey]) : d[xKey]; // Conditional required for sapper
				return {
					key,
					[yKey]: +d[key],
					[xKey]: d[xKey]
				};
			})
		};
	});

	const flatten = data => data.reduce((memo, group) => {
		return memo.concat(group.values);
	}, []);
	
	const formatTickY = d => format(`.${precisionFixed(d)}s`)(d);
	const formatTickX = d => new Date(d).toLocaleDateString('no-NO', {day: '2-digit', month: '2-digit', year: '2-digit'});

	// moving average:
	// https://stackoverflow.com/questions/60211628/moving-average-of-time-series-objects-in-array

	const getAverage = (data) => data.reduce((acc, val) => acc + val.value, 0) / data.length;
	
	const computeMovingAverage = (data, period) => {
		const avgsArr = [];
			data.forEach(function (obj){
				const movingAverages = [];
				const sortedData = sortDates(obj.values);

				if (period > sortedData.length) { return getAverage(data); }
				
				for (let x = 0; x + period - 1 < sortedData.length; x += 1) {
					if (period > 1) {
						
						movingAverages.push({
							key: sortedData[0].key,
							value: Math.round(getAverage(sortedData.slice(x, x + period))),
							date: sortedData.slice(x, x + period)[Math.round(period/2)].date
						})
					} else {
						movingAverages.push({
							key: sortedData[0].key,
							value: getAverage(sortedData.slice(x, x + period)),	
							date: sortedData.slice(x, x + period)[0].date	
						})
					}
				}
			avgsArr.push({
				"key": obj.key,
				"values": movingAverages
			})
		})
		return avgsArr;
	}
	let range = 7;
	let MovingAverage;
	$: MovingAverage = computeMovingAverage(dataLong, range);
	$: mvAvgDtEnd = MovingAverage[0].values[MovingAverage[0].values.length-1].date.toLocaleDateString('no-NO')
	$: mvAvgDtStart = MovingAverage[0].values[0].date.toLocaleDateString('no-NO')
	$: mvUniqueDates = uniques(MovingAverage[0].values, "date")
	
	$: MovingAverageTooltip = movingAvgTooltip(data2, range);
	

	let highlightExists = false
	const selectHighlight = (item) => {
		if (item == "car") {
			seriesColors = brightCar
			highlightExists = true
		} else if (item == "bus") {
			seriesColors = highlightExists = brightBus
			
		} else if (item == "ped") {
			seriesColors = brightPed
			highlightExists = true
		} else if (item == "x"){
			seriesColors = brightColors
			highlightExists = false
		}
	}


</script>

<article class="text">
<h2>Mobilitetsdata fra Apple</h2>
<p>Viser relativ mengde bevegelse med 
	<strong class="modus" style="color:{seriesColors[0]}" on:click={() => selectHighlight("car")}>bil</strong>, 
	<strong class="modus" style="color:{seriesColors[1]}"on:click={() => selectHighlight("bus")}>kollektivtransport</strong> og 
	<strong class="modus" style="color:{seriesColors[2]}"on:click={() => selectHighlight("ped")}>til fots</strong> 
	relativt til Apples anslag av normalnivået.
	</p>
<p><span>{#if range>1}Glidende gjennomsnitt over {range} dager{:else}Alle tall{/if} mellom {mvAvgDtStart} og {mvAvgDtEnd}.</span></p>
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
</article>
<section>
	<article class="topcontrols" style="text-align: center">
			<Car32
				on:click={() => selectHighlight("car")}
				style="fill: {seriesColors[0]}" />
			<Bus32 
				on:click={() => selectHighlight("bus")}
				style="fill: {seriesColors[1]}" />
			<Pedestrian32 
				on:click={() => selectHighlight("ped")}
				style="fill: {seriesColors[2]}" />
			{#if highlightExists}
			<Close32
				class="xbtn"
				on:click={() => selectHighlight("x")}
			/>
			{/if}
	</article>
<article class="chart">
		<div class="chart-container">
			<LayerCake
				ssr={true}
				percentRange={true}
				x={xKey}
				y={yKey}
				z={zKey}
				zScale={scaleOrdinal()}
				zDomain={seriesNames}
				zRange={seriesColors}
				flatData={flatten(MovingAverage)}
				yDomain={[null, null]}
				data={MovingAverage}
			>
				<ScaledSvg>

					<MultiLine
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
				
					<!-- need to output movingavg in data2's original format for this to work
					ignoring for now -->
					<Html>
					<SharedTooltip
						formatTitle={formatTickX}
						dataset={MovingAverageTooltip}
					/>
				</Html>
			</LayerCake>
		</div>
	</article>

</section>
<style>

strong.modus{
	cursor:pointer;
}

</style>
