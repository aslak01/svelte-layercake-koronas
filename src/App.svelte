<script>
	import { SpinLine } from 'svelte-loading-spinners';
	import Coronavirus32 from "carbon-icons-svelte/lib/Coronavirus32";
	
	import { getData } from './utils/fetch.js'
	import { getData2 } from './utils/fetch1.js';

	
	// todo:
	// solid line at 0 in apple chart
	// error handling apple chart
	// organising minidays by insidens
	// disable dropdown on countryadd
	// la bruker søke på et land som finnes i defaultsene uten at det kræsjer
	// fikse bugg i at skala i minicharts ikke reflekterer endringer i range
	
	import ChartsJHday from './ChJH.day.svelte';
	// import ChartsJHtot from './ChJH.tot.svelte';
	import ChartsApple from './ChApple.svelte';
	import ChartsFHI from './ChFHI.svelte';
	
	import CountrySearch from './CountrySearch.svelte';
	
	const highlightColor = "#ffa600"
	
	let selectedValue = {label: "Norge", value: "nor"}
	// $: console.log(selectedValue)
	// import ChartsKart1 from './ChKart.svelte';
	
	let request
	
	$: selectedValue ? request = selectedValue.value : request = "Norway"
	
	$: response = getData2("https://disease.sh/v3/covid-19/historical/" + request + "?lastdays=all")
	$: response2 = getData("https://disease.sh/v3/covid-19/apple/countries/" + request + "/All");
	 
</script>

<main>
<header>
<article class="text">
	<h1 class="header">	
		<Coronavirus32 
			style="fill: {highlightColor}"
		/>
		Korona&shy;virus i </h1><CountrySearch bind:selectedValue
 />
	<!-- <ChartsKart1 /> -->
	<h2 style="font-weight: normal;">
		
		Det er nå meldt
		
		{#await $response}...{:then data}
			<strong style="color: {highlightColor}">
				{new Intl.NumberFormat("no-NO").format(data.info.totalCases)}
			</strong>
		{/await}
		
		diagnoser av Covid-19 i 
		
		<strong style="color: {highlightColor}">{selectedValue.label}</strong>. 
		
		Av disse var 
		
		{#await $response}...{:then data}
			<strong style="color: {highlightColor}">
				{new Intl.NumberFormat("no-NO").format(data.info.lastReportCases)}
			</strong>
		{/await}
		fra siste rapport,
		{#await $response}...{:then data}
			{data.info.lastReport.toLocaleDateString('no-NO')}.
		{/await}
	</h2>
</article>
</header>



{#await $response}
	<article class="text">
		<h2>Diagnoser per dag</h2>
	</article>
		<div class="restricted">
			<SpinLine size="60" color="#FF3E00" unit="px"></SpinLine>
		</div>
	{:then data}
		<ChartsJHday {data} {highlightColor} mainSelection={selectedValue} />
	{/await}


	<!-- {#await $response}
	<article class="text">
		<h2>Totale diagnoser</h2>
	</article>
		<div class="restricted">
			<SpinLine size="60" color="#FF3E00" unit="px"></SpinLine>
		</div>
	{:then data}
		<ChartsJHtot {data} {highlightColor} />
	{/await} --> 


	{#await $response2}
		<article class="text">
			Henter mobilitetsdata.
		</article>
	{:then data}
		<ChartsApple {data} {highlightColor} />
	{/await}

	{#if selectedValue.value === 'nor'}
		<ChartsFHI />
  {/if}
 
	 <footer>
		 <article class="text">
			 <p><span>
				 Denne siden holdes automatisk oppdatert med de siste tallene fra <a href="https://coronavirus.jhu.edu">Johns Hopkins-databasen (JHUCSSE)</a>. De samler tallene sine fra diverse offentlige databaser som ikke alltid er helt enige med hverandre. Mindre avvik kan derfor forekomme, men tendensene er som regel de samme. JHUCSSE- og Apple-tall via <a href="http://disease.sh">disease.sh</a>.
			 </span></p>
		 </article>
	 </footer>

</main>

<style lang="scss" global>
	@use "sass:color";

	$basecol: #1a1f29;
	/* $darker: #12141b; */
	$darker: scale-color(#1a1f29, $lightness: -12%);

body {
	padding: 0;
	margin: 0;
	/* background: #3d3838; */
	/* background: #191e26; */
	/* background: #3a2e2e; */
	/* background: #1a1827; */
	color: #e0dcdc;
	/* background: #182025; */
	/* background: #181d1f */
	/* background: #13171d */
	/* background: #101216 */
	background: $basecol;
/* background: rgb(26,31,41);
background: linear-gradient(207deg, rgba(26,31,41,1) 38%, rgba(87,52,88,1) 100%); */
}

main {
	max-width: 100%; overflow-x: hidden;
}

header {
	/* position: sticky;
	position: -webkit-sticky;
	top: 0; */
	margin-top: 4rem;
}

	h2 {
		padding-top: 30px;
	}
	h1 {
		padding-top: 100px;
	}
	
	h1.header {
		display: inline;
	}
	
	.restricted {
		width: 60px;
		display: block;
		margin: 0 auto;
		padding: 3em 0;
	}
	article.chart {
		width: 80vw;
		max-width: 1200px;
		height: 45vh;
		max-height: 600px;
		padding-top: 3rem;
		padding-bottom: 2rem;
		margin: 0 auto;
	}
	article.text {
	width: 80vw;
	max-width: 1200px;
	margin: 0 auto;
	height: auto;
	padding-bottom: 1.5rem;
	padding-top: 3rem;
	}
	article.controls {
	height: auto;
	padding: 0 0 1rem 0;
	width: 80vw;
	max-width: 1200px;
	margin: 0 auto;
		label {
			font-size: .8rem;
		}
	}
	article.topcontrols {
		height: auto;
		padding-bottom: 0;
		padding-top: 2rem;
		position: relative;
		svg {
			cursor: pointer;
			&:not(:first-of-type){
				margin-left: 2rem;
			}
			&.xbtn {
				position: absolute;
				left: 50%;
				top: -1rem;
				margin: 0;
				margin-left: -16px;
			}
		}
	}
	/* article:last-of-type {
		padding-bottom: 50px;
	} */
	.chart-container {
		width: 100%;
		height: 100%;
	}
	p span {
		font-size: 0.8rem;
		font-weight: normal;
	}
	html {
		box-sizing: border-box;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
			Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;	
	}
	section {
		/* background: #4c4c4c; */
		/* background: #1d1a21; */
		/* background: #211c29; */
		/* background: #15181d */
		/* background: #151921 */
		background: $darker;
	}
	a {
		/* color: #fae955; */
		color: #ded68c;
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
	a:visited {
		color: #c7bfbf;
	}
	.controls-doubleslide {
		height: auto;
		width: 98%;
		max-width: 1500px;
		/* padding: 0 auto; */
		margin: 0 auto;
		padding: 2rem 0 1.5rem 0;
		display: grid;
		grid-template-columns: 55px auto 55px;
		justify-content: stretch;
		column-gap: 15px;
		.doubleslide {
			min-width: 120px;
		}
		p {
			&:not(:last-of-type){
				justify-self: end;
			}
			align-self: flex-end;
			
		}	
	}
	
	@media (max-width: 400px) {
		.minicountries {
			display: block;
		}
	}
	
	
	section.minicountries {
		width: 100%;
		max-width: 1400px;
		height: auto;
		display: flex;
		align-items: center;
		/* justify-content: center; */
		justify-content: space-around;
		flex-flow: row wrap;
		padding: .5rem;
		padding-left: .8rem;
	
	
		/* display: grid; */
		/* grid-auto-flow: dense;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		justify-items: center;
		align-items: center;
		grid-gap: 1rem; */		
		margin: 0 auto;
		/* grid-template-columns: 1fr 1fr 1fr 1fr 1fr; */
		.mini {
			background: $darker;
			article.text {
				padding: 0;
			}
		}

	}

</style>