<script>
  import { getContext } from 'svelte';
  import { max } from 'd3-array';
  
  export let labelValue = undefined
  $: label = new Intl.NumberFormat("no-NO").format(labelValue)
  
  function convert(n) {
    var order = Math.floor(Math.log(n) / Math.LN10
                       + 0.000000001); // because float math sucks like that
    // return Math.pow(10,order);
    return order
  }
  
  $: offset = convert(labelValue)
  // console.log(convert(labelValue))

  const { data, x, y, xScale, yScale, xRange, yRange, xGet, yGet } = getContext('LayerCake');
  /* --------------------------------------------
	 * Title case the first letter
	 */
	// const cap = val => val.replace(/^\w/, d => d.toUpperCase());

  /* --------------------------------------------
	 * Put the label on the highest value
	 */
  // $: console.log($data)
  // $: console.log(labelValue, ": ", $xGet($data[$data.length-1]), $yGet($data[$data.length-1]))
  // $: console.log(labelValue, ": ", $xScale($data[$data.length-1]), $yScale($data[$data.length-1]))
  // $: console.log($data[$data.length-1])
  // $: console.log(labelValue, ": ", $data)
  $: left = $xGet($data[$data.length-1]) / 100
   // /  Math.max(...$xRange);
  $: top = $yGet($data[$data.length-1]) / 100
   // / Math.max(...$yRange);
</script>


	<div
    class="label"
    style="
      top:{top * 100 + 7 }%;
      left:{left * 100 + 10 + (6 * offset)}%;
    "
  >{label}</div>


<style>
	.label {
		position: absolute;
		transform: translate(-100%, -100%)translateY(1px);
		font-size: 10px;
	}
</style>
