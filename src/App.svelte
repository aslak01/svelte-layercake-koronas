<script>
	import { SpinLine } from 'svelte-loading-spinners';
	import Coronavirus32 from "carbon-icons-svelte/lib/Coronavirus32";
	
	import { getData } from './utils/fetch.js'
	import { getData2 } from './utils/fetch1.js';

	const response3 = getData("https://api.apify.com/v2/key-value-stores/3qlmMu1XN2ZLoVIQt/records/LATEST?disableRedirect=true");
	
	
	
	import ChartsJHday from './ChJH.day.svelte';
	import ChartsJHtot from './ChJH.tot.svelte';
	import ChartsApple from './ChApple.svelte';
	import ChartsFHI from './ChFHI.svelte';
	
	import CountrySearch from './CountrySearch.svelte';
	
	const highlightColor = "#ffa600"
	
	let selectedCountry = {id: 578, name: "Norge", alpha2: "no", alpha3: "nor"}
	$: console.log(selectedCountry)
	// import ChartsKart1 from './ChKart.svelte';
	
	let request
	
	$: selectedCountry ? request = selectedCountry.alpha3 : request = "Norway"
	
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
		Korona&shy;virus i </h1><CountrySearch bind:selectedCountry />
	<!-- <ChartsKart1 /> -->
	<p>
		
		Det er nå meldt
		
		{#await $response}...{:then data}
			<strong style="color: {highlightColor}">
				{new Intl.NumberFormat("no-NO").format(data.info.totalCases)}
			</strong>
		{/await}
		
		diagnoser av Covid-19 i {selectedCountry.name}. Av disse var 
		
		{#await $response}...{:then data}
			<strong style="color: {highlightColor}">
				{data.info.lastReportCases}
			</strong>
		{/await}
		fra siste rapport,
		{#await $response}...{:then data}
			<strong>
				{data.info.lastReport.toLocaleDateString('no-NO')}
			</strong>
		{/await}.
	</p>
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
		<ChartsJHday {data} />
	{/await}
	
	{#await $response}
	<article class="text">
		<h2>Totale diagnoser</h2>
	</article>
		<div class="restricted">
			<SpinLine size="60" color="#FF3E00" unit="px"></SpinLine>
		</div>
	{:then data}
		<ChartsJHtot data={data} />
	{/await}


	{#await $response2}
	<article class="text">
		<h2>Mobilitetsdata fra Apple</h2>
	</article>
		<div class="restricted">
			<SpinLine size="60" color="#FF3E00" unit="px"></SpinLine>
		</div>
	{:then data}
		<ChartsApple {data}/>
	{/await}

	
	{#await $response3}
	<article class="text">
		<h2>Sykdom rapportert til MSIS, 2016–2020</h2>
	</article>
		<div class="restricted">
			<SpinLine size="60" color="#FF3E00" unit="px"></SpinLine>
		</div>
	{:then data3}
		<ChartsFHI koronaVirus={data3.infected} />
	{/await}
  
 
	 <footer>
		 <article class="text">
			 <p><span>
				 Denne siden holdes automatisk oppdatert med de siste tallene fra <a href="https://coronavirus.jhu.edu">Johns Hopkins-databasen (JHUCSSE)</a>. Disse er verdensomspennende, så de kan være litt i utakt med <a href="https://www.fhi.no/sv/smittsomme-sykdommer/corona/dags--og-ukerapporter/dags--og-ukerapporter-om-koronavirus/">FHI sine tall</a>, men stort sett ganske nært opptil. De siste FHI-tallene jeg har tilgjengelig viser
				 {#await $response3}...{:then data3}{data3.infected}{/await}
				 totale diagnoser (sist oppdatert
				 {#await $response3}...{:then data3}{new Date(data3.lastUpdatedAtSource).toLocaleDateString('no-NO')}{/await}).
			 </span></p>
		 </article>
	 </footer>

</main>

<style lang="scss" global>
	@use "sass:color";

	$basecol: #1a1f29;
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
		input[type=range] {
			-webkit-appearance: none;
			width: 100%;
			padding: 0;
			border: 0;
		}
		input[type=range]:focus {
			outline: none;
		}
		input[type=range]::-webkit-slider-runnable-track {
			width: 100%;
			height: 2px;
			cursor: pointer;
			background: black;
		}
		input[type=range]::-webkit-slider-thumb {
			height: 26px;
			width: 26px;
			border-radius: 26px;
			background: white;
			cursor: pointer;
			-webkit-appearance: none;
			margin-top: -10px;
		}
		input[type=range]:focus::-webkit-slider-runnable-track {
			background: black;
		}
		input[type=range]::-moz-range-track {
			width: 100%;
			height: 2px;
			cursor: pointer;
			background: black;
		}
		input[type=range]::-moz-range-thumb {
			height: 26px;
			width: 26px;
			border-radius: 26px;
			background: #ffffff;
			cursor: pointer;
		}
		input[type=range]::-ms-track {
			width: 100%;
			height: 2px;
			cursor: pointer;
			background: transparent;
			border-color: transparent;
			color: transparent;
		}
		input[type=range]::-ms-fill-lower {
			background: black;
		}
		input[type=range]::-ms-fill-upper {
			background: black;
		}
		input[type=range]::-ms-thumb {
			height: 26px;
			width: 26px;
			border-radius: 26px;
			background: white;
			cursor: pointer;
		}
		input[type=range]:focus::-ms-fill-lower {
			background: black;
		}
		input[type=range]:focus::-ms-fill-upper {
			background: black;
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