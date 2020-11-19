<script>
	import { clamp } from 'yootils';
	
	export let min;
	export let max;
	
	let brush;
	
	const p = x => {
		const { left, right } = brush.getBoundingClientRect();
		return clamp((x - left) / (right - left), 0, 1);
	};
	
	const handler = fn => {
		return e => {
			if (e.type === 'touchstart') {
				if (e.touches.length !== 1) return;
				e = e.touches[0];
			}
			
			const id = e.identifier;
			const start = { min, max, p: p(e.clientX) };

			const handle_move = e => {
				if (e.type === 'touchmove') {
					if (e.changedTouches.length !== 1) return;
					e = e.changedTouches[0];
					if (e.identifier !== id) return;
				}
				
				fn(start, p(e.clientX));
			};

			const handle_end = e => {
				if (e.type === 'touchend') {
					if (e.changedTouches.length !== 1) return;
					if (e.changedTouches[0].identifier !== id) return;
				}
				
				window.removeEventListener('mousemove', handle_move);
				window.removeEventListener('mouseup', handle_end);
				
				window.removeEventListener('touchmove', handle_move);
				window.removeEventListener('touchend', handle_end);
			};

			window.addEventListener('mousemove', handle_move);
			window.addEventListener('mouseup', handle_end);

			window.addEventListener('touchmove', handle_move);
			window.addEventListener('touchend', handle_end);
		};
	};
	
	const reset = handler((start, p) => {
		min = clamp(Math.min(start.p, p), 0, 1);
		max = clamp(Math.max(start.p, p), 0, 1);
	});
	
	const move = handler((start, p) => {
		const d = clamp(p - start.p, -start.min, 1 - start.max);
		min = start.min + d;
		max = start.max + d;
	});
	
	const adjust_min = handler((start, p) => {
		min = p > start.max ? start.max : p;
		max = p > start.max ? p : start.max;
	});
	
	const adjust_max = handler((start, p) => {
		min = p < start.min ? p : start.min;
		max = p < start.min ? start.min : p;
	});
		
	$: left = 100 * min;
	$: right = 100 * (1 - max);
	
	import { LayerCake, Svg } from 'layercake';
	import Line from './Line.svelte';
	import Area from './Area.svelte';

	export let x;
	export let y;
	export let data;
	
	export let highlightColor;
	
	
</script>

<div bind:this={brush} class="brush-outer" on:mousedown={reset}>
	{#if min !== null}
	<div class="chart-container">
		<LayerCake
			{x} {y} {data}
			>
		<Svg>
			<Line
				strokeWidth=1
				stroke='white'
			/>
			<Area 
				opacity='.6'
				fill='white'
			/>
		</Svg>
		</LayerCake>
	</div>
		<div class="brush-inner" on:mousedown|stopPropagation={move} style="left: {left}%; right: {right}%;"></div>
		<!-- border-right: 4px solid {highlightColor}; border-left: 4px solid {highlightColor}; -->
		<div class="brush-handle" on:mousedown|stopPropagation={adjust_min} style="left: {left}%;"></div>
		<div class="brush-handle" on:mousedown|stopPropagation={adjust_max} style="right: {right}%;"></div>
	{/if}
</div>

<style>

.chart-container {
	position: absolute;
	width: 100%;
	height: 100%;
}



	.brush-outer {
		position: relative;
		width: 100%;
		height: 2em;
		margin: 0 0 1em 0;
		border: 1px solid #333;
	}
	
	.brush-inner {
		box-sizing: margin-box;
		position: absolute;
		height: 100%;
		cursor: move;
		background: #ffffff30
}
	
	.brush-handle {
		position: absolute;
		width: 0;
		height: 100%;
		cursor: ew-resize;
	}
	
	.brush-handle::before {
		position: absolute;
		content: '';
		width: 8px;
		left: -4px;
		height: 100%;
		background: #ffa600;
	}
</style>