<script>
	// TOT MAIN

	import { LayerCake, ScaledSvg, Html, uniques } from 'layercake';

	import DualSlider from './utils/DualSlider.svelte';
	
	import Line from './components/Line.svelte';
	import AxisX from './components/AxisX.html.svelte';
	import AxisY from './components/AxisY.html.svelte';
	import SharedTooltip from './components/SharedTooltip.percent-range.svelte';
	
	const formatTickX = d => new Date(d).toLocaleDateString('no-NO', {day: '2-digit', month: '2-digit', year: '2-digit'});
	const formatTickY = d => new Intl.NumberFormat("no-NO").format(d);
	const stroke = '#eee';
	const xTickColor = "#ffa600";
	const yTickColor = "#ffa600";
	const textHighlightColor = "#ffa600";

	export let data
	
	let firstReport = data.info.firstReport.toLocaleDateString('no-NO')
	let lastReport = data.info.lastReport.toLocaleDateString('no-NO')
	
	// moving average:
	// https://stackoverflow.com/questions/60211628/moving-average-of-time-series-objects-in-array
	// Data cutter
	let starter = ((data.data.total.findIndex(n => n.total >0)-2)/data.data.total.length)
	let start = starter
	let end = 1
	const chartData = data.data.total;
	const entries = chartData.length;
	
	let cutData = (data, x, y) => {
		let firstSlice = Math.round(start * entries)
		let lastSlice = Math.round(end*(entries))
		if (lastSlice-firstSlice>=2) {
			return data.slice(firstSlice, lastSlice)
		} else if (lastSlice < 2) {
			return data.slice(firstSlice, lastSlice+2)
		} else if (firstSlice-entries < 1) {
			return data.slice(firstSlice-2, lastSlice)
		}
	}
	let shavedData = chartData
	$: shavedData = cutData(chartData, start, end)
	
	$: firstReportShaved = shavedData[0].date.toLocaleDateString('no-NO')
	$: lastReportShaved = shavedData[shavedData.length-1].date.toLocaleDateString('no-NO')
	let options = { day: 'numeric', month: 'numeric', year: '2-digit' }
	$: firstRepShort = shavedData[0].date.toLocaleDateString('no-NO', options)
	$: lastRepShort = shavedData[shavedData.length-1].date.toLocaleDateString('no-NO', options)
	$: lastDay = new Intl.NumberFormat("no-NO").format(shavedData[shavedData.length-1].total)
	$: lastDayNew = new Intl.NumberFormat("no-NO").format(shavedData[shavedData.length-1].total - shavedData[shavedData.length-2].total)
	
	$: mvUniqueDates = uniques(shavedData, "date")

	
	import { getData } from './utils/fetch4.js';
	
	const norge = [
		{iso: "NOR", norsk: "Norge", befolkning: "5367580", tetthet: "16.58"},
	]
	
	const countries = {
		"Finland": {iso: "FIN", norsk: "Finland", befolkning: "5527405", tetthet: "16.33"},
		"Congo": {iso: "COG", norsk: "Rep. Kongo", befolkning: "5399895", tetthet: "15.79"},
		"Paraguay": {iso: "PRY", norsk: "Paraguay", befolkning: "7052983", tetthet: "17.1"},
		"New Zealand": {iso: "NZL", norsk: "Ny-Zealand", befolkning: "5093882", tetthet: "19"},
		"Oman": {iso: "OMN", norsk: "Oman", befolkning: "4645249", tetthet: "15.01"},
		"Sweden": {iso: "SWE", norsk: "Sverige", befolkning: "10343403", tetthet: "22.97"},
		"USA": {iso: "USA", norsk: "USA"},
		"France": {iso: "FRA", norsk: "Frankrike"},
		"Italy": {iso: "ITA", norsk: "Italia"},
		"Germany": {iso: "GER", norsk: "Tyskland"},
		"Spain": {iso: "SPA", norsk: "Spania"}
	}
	

	const finland = getData("https://disease.sh/v3/covid-19/historical/Finland?lastdays=all");
	const paraguay = getData("https://disease.sh/v3/covid-19/historical/Paraguay?lastdays=all");
	const congo = getData("https://disease.sh/v3/covid-19/historical/COG?lastdays=all");
	const nzl = getData("https://disease.sh/v3/covid-19/historical/NZL?lastdays=all");
	const oman = getData("https://disease.sh/v3/covid-19/historical/Oman?lastdays=all");
	const usa = getData("https://disease.sh/v3/covid-19/historical/USA?lastdays=all");
	const france = getData("https://disease.sh/v3/covid-19/historical/France?lastdays=all");
	const ita = getData("https://disease.sh/v3/covid-19/historical/Italy?lastdays=all");
	const ger = getData("https://disease.sh/v3/covid-19/historical/Germany?lastdays=all");
	const spa = getData("https://disease.sh/v3/covid-19/historical/Spain?lastdays=all");
	
	
	import ChMiniTot from './ChMiniTot.svelte';
	
	
	
</script>


<article class="text">
	<h2>
		Totale diagnoser: 
		<span style="color: {textHighlightColor}">
			{lastDay}</span>. 
	</h2>
	<h4>
		+
		<span style="color: {textHighlightColor}">
			{lastDayNew}
		</span>
		nye {lastReportShaved}.
	</h4>
</article>
<section>
	<article class="chart">
		<div class="chart-container">
	
			<LayerCake
				ssr={true}
				percentRange={true}
				x='date'
				y='total'
				yDomain={[null, null]}
				data={shavedData}
			>
				<ScaledSvg>
					<Line
						stroke={stroke}
						strokeWidth="3"
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
						baseline={true}
						{xTickColor}
					/>
					<AxisY 
						ticks={4}
						gridlines={true}
						formatTick={formatTickY}
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
		</div>
	</article>
	<article class="controls-doubleslide">
		<p><span>{firstRepShort}</span></p>
		<div class="doubleslide">
			<!-- <p><span>Juster periode:</span></p> -->
			<DualSlider 
			bind:start
			bind:end
			/>
		</div>
		<p><span>{lastRepShort}</span></p>
	</article>
</section>
<article class="text" style="padding-top:1.5rem"><p>Utvalg land med lignende befolkning og befolkningstetthet som Norge over de samme datoene:</p></article>
<section class="minicountries">
	{#await $finland}
		...
	{:then data}
		<ChMiniTot data={data} start={start} end={end} name={countries[data.info.country].norsk} 
		/>
	{/await}
	{#await $paraguay}
		...
	{:then data}
		<ChMiniTot data={data} start={start} end={end} 
		name={countries[data.info.country].norsk} 
		/>
	{/await}
	{#await $congo}
		...
	{:then data}
		<ChMiniTot data={data} start={start} end={end} 
		name={countries[data.info.country].norsk}
		/>
	{/await}
	{#await $nzl}
		...
	{:then data}
		<ChMiniTot data={data} start={start} end={end} 
		name={countries[data.info.country].norsk}
		/>
	{/await}
	
	{#await $oman}
		...
	{:then data}
		<ChMiniTot data={data} start={start} end={end} 
		name={countries[data.info.country].norsk}
		/>
	{/await}
		
</section>

<article class="text" style="padding-top:1.5rem"><p>Utvalg større land:</p></article>


<section class="minicountries">
	
	{#await $usa}
		...
	{:then data}
		<ChMiniTot data={data} start={start} end={end} 
		name={countries[data.info.country].norsk}
		/>
	{/await}
	{#await $france}
		...
	{:then data}
		<ChMiniTot data={data} start={start} end={end} 
		name={countries[data.info.country].norsk}
		/>
	{/await}
	{#await $spa}
		...
	{:then data}
		<ChMiniTot data={data} start={start} end={end} 
		name={countries[data.info.country].norsk}
		/>
	{#await $ita}
		...
	{:then data}
		<ChMiniTot data={data} start={start} end={end} 
		name={countries[data.info.country].norsk}
		/>
	{/await}
	{#await $ger}
		...
	{:then data}
		<ChMiniTot data={data} start={start} end={end} 
		name={countries[data.info.country].norsk}
		/>
	{/await}
	{/await}

</section>

<style>

</style>
