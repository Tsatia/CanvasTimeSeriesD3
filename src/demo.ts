import{CanvasTimeSeriesPlot} from './CanvasTimeSeriesPlot';
import * as d3 from 'd3';

function getDemoPlotSize(): Array<number> {
	return [window.innerWidth-100, Math.round(0.45*(window.innerWidth-100))];
}

function addDays(date: Date, days: number): Date {
    date.setDate(date.getDate() + days);
    return date;
}

// var plot2 = new CanvasTimeSeriesPlot(d3.select("#maincontainer"), getDemoPlotSize(), {
//     yAxisLabel: "Voltage [V]"
// });

