"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getDemoPlotSize() {
    return [window.innerWidth - 100, Math.round(0.45 * (window.innerWidth - 100))];
}
function addDays(date, days) {
    date.setDate(date.getDate() + days);
    return date;
}
// var plot2 = new CanvasTimeSeriesPlot(d3.select("#maincontainer"), getDemoPlotSize(), {
//     yAxisLabel: "Voltage [V]"
// });
