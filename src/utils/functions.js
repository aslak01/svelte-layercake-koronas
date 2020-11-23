// moving average:
// https://stackoverflow.com/questions/60211628/moving-average-of-time-series-objects-in-array	

export function computeMovingAverage(data, period, datekey, valuekey) {
	const sortDates = (data, datekey) => data.sort((a, b) => new Date(a[datekey]) - new Date (b[datekey]));
	const getAverage = (data, valuekey) => data.reduce((acc, val) => acc + val[valuekey], 0) / data.length;
	
	const movingAverages = [];
	const sortedData = sortDates(data, 'date');

	if (period > sortedData.length) { return getAverage(data, valuekey); }
	for (let x = 0; x + period - 1 < sortedData.length; x += 1) {
		if (period > 1) {
			movingAverages.push({
				avg: Math.round(getAverage(sortedData.slice(x, x + period), valuekey)),
				date: sortedData.slice(x, x + period)[Math.round(period/2)][datekey]	// Middle
				// date: sortedData.slice(x, x + period)[period-1].date						// End
			})
		} else {
			movingAverages.push({
				avg: getAverage(sortedData.slice(x, x + period), valuekey),	
				date: sortedData.slice(x, x + period)[0][datekey]
			})
		}
	}
	return movingAverages;
}


export function cutData(data, start, end) {
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
