import * as d3 from 'd3';
import * as d3Axis from 'd3-axis';

class CanvasTimeSeriesPlot{

    parent: d3.Selection<HTMLElement, {} , HTMLElement , {}>;
	canvasDimensions: Array<number>;
	config: CanvasTimeSeriesPlot.Config;
	data : Array<{xDate: Date; yNum: number}>; 
	dataIDs: Array<string>;
	dataLabels: Array<string>;
	displayIndexStart: Array<number>; 
	displayIndexEnd: Array<number>;
	dataColors : Array<string>;
	xAxisLabelText: string;
	yAxisLabelText: string;

	 
	disableLegend: boolean;
	invertYAxis: boolean;
	gridColor: string;
	markerLineWidth: number;
	markerRadius: number;
	xTicksPerPixel: number;
	yTicksPerPixel: number;
	minCanvasWidth: number;
	minCanvasHeight: number;
	legendMargin: number;
	legendXPadding: number;
	legendYPadding: number;
	legendLineHeight: number;
	margin: CanvasTimeSeriesPlot.PlotMargins;
	totalWidth: number;
	totalHeight: number;
	width: number;
	height: number;

	div: d3.Selection<any, {} , HTMLElement , {}>;
	d3Canvas: d3.Selection<any, {} , any , {}>;
	canvas: CanvasRenderingContext2D;
	svg: d3.Selection<any, {} , any , {}>;
	svgTranslateGroup: d3.Selection<any, {} , any , {}>;

	xScale: d3Axis.AxisScale<Date>;
	yScale: d3Axis.AxisScale<number>;
	xAxis: d3Axis.Axis<d3Axis.AxisDomain>;
	yAxis: d3Axis.Axis<d3Axis.AxisDomain>;
	xAxisLabel: d3.Selection<SVGTextElement, {} , any , {}>; 
	yAxisLabel: d3.Selection<SVGTextElement, {} , any , {}>;
	yAxisGroup: d3.Selection<any, {} , any , {}>;
	xAxisGroup: d3.Selection<any, {} , any , {}>;
    
    constructor(parentElement: d3.Selection<HTMLElement, {} , HTMLElement , {}>, canvasDimensions: Array<number>, 
        config: CanvasTimeSeriesPlot.Config = {}){
            this.parent = parentElement;
            this.canvasDimensions = canvasDimensions;
            this.config = config;
            this.data = [];
            this.dataIDs = [];
            this.dataLabels = [];
            this.displayIndexStart = [];
            this.displayIndexEnd = [];
            this.dataColors = [];
            this.xAxisLabelText = config.xAxisLabel || "";
            this.yAxisLabelText = config.yAxisLabel || "";
    
            this.disableLegend = config.disableLegend || false;
            this.invertYAxis = config.invertYAxis || false;
            this.gridColor = config.gridColor || "#DFDFDF";
            this.markerLineWidth = config.markerLineWidth || 1;
            this.markerRadius = config.markerRadius || 3.0;
            this.xTicksPerPixel = config.xTicksPerPixel || 1.0/92.0;
            this.yTicksPerPixel = config.yTicksPerPixel || 1.0/40.0;
            this.minCanvasWidth = config.minCanvasWidth || 250;
            this.minCanvasHeight = config.minCanvasHeight || 150;
            this.legendMargin = config.legendMargin || 10;
            this.legendXPadding = config.legendXPadding || 5;
            this.legendYPadding = config.legendYPadding || 6;
            this.legendLineHeight = config.legendLineHeight || 11;
            this.margin = config.plotMargins || {top: 20, right: 20, bottom: (this.xAxisLabelText.length > 0 ? 60 : 30), 
                left:(this.yAxisLabelText.length > 0) ? 65 : 50};
            this.totalWidth = Math.max(this.minCanvasWidth, canvasDimensions[0]);
            this.totalHeight = Math.max(this.minCanvasHeight, canvasDimensions[1]);
            this.width = this.totalWidth - this.margin.left! - this.margin.right!;
            this.height = this.totalHeight - this.margin.top! - this.margin.bottom!;


            this.div = this.parent.append("div")
                .attr("class", "cvpChart")
                .style("width", this.totalWidth+"px")
                .style("height", this.totalHeight+"px");

            this.d3Canvas = this.div.append("canvas")
                .attr("class", "cvpCanvas")
                .attr("width", this.width)
                .attr("height", this.height)
                .style("padding", this.margin.top + "px " + this.margin.right + "px " + this.margin.bottom + "px " +
                     this.margin.left + "px");
            // where to draw the data
            this.canvas = this.d3Canvas.node().getContext("2d");

            this.svg = this.div.append("svg")
                .attr("class", "cvpSVG")
                .attr("width", this.totalWidth)
                .attr("height", this.totalHeight);

            this.svgTranslateGroup = this.svg.append("g").
                attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
                
            this.setupXScaleAndAxis();
            this.setupYScaleAndAxis();

            this.yAxisGroup = this.svgTranslateGroup.append("g")
		        .attr("class", "y cvpAxis")
                .call(this.yAxis);
                
	        this.xAxisGroup = this.svgTranslateGroup.append("g")
		        .attr("class", "x cvpAxis")
		        .attr("transform", "translate(0,"+this.height+")")
		        .call(this.xAxis);

        	if(this.xAxisLabelText.length > 0) {
		        this.xAxisLabel = this.svgTranslateGroup.append("text")
			    .attr("class", "cvpLabel")
			    .attr("x", Math.round(0.5*this.width))
			    .attr("y", this.height + 40)
			    .attr("text-anchor", "middle")
			    .text(this.xAxisLabelText);
            }
            
	        if(this.yAxisLabelText.length > 0) {
		        this.yAxisLabel = this.svg.append("text")
			    .attr("class", "cvpLabel")
			    .attr("x", Math.round(-0.5*this.height - this.margin.top))
			    .attr("y", 15)
			    .attr("transform", "rotate(-90)")
			    .attr("text-anchor", "middle")
			    .text(this.yAxisLabelText);
            }
            
            this.drawCanvas();

            
    }
    // Constructor ends here

    setupXScaleAndAxis() {
        throw new Error("Method not implemented.");
    }
    setupYScaleAndAxis() {
        throw new Error("Method not implemented.");
    }

    drawCanvas() {
        throw new Error("Method not implemented.");
    }





}



export namespace CanvasTimeSeriesPlot{
	export interface Config{
		xAxisLabel?: string,
		yAxisLabel?: string,
		markerLineWidth?: number,
		markerRadius?: number,
		updateViewCallback?: undefined,
		disableLegend?: boolean,
		invertYAxis?: boolean,
		gridColor?: string,
		xTicksPerPixel?: number,
		yTicksPerPixel?: number,
		minCanvasWidth?: number,
		minCanvasHeight?: number,
		legendMargin?: number,
		legendXPadding?: number,
		legendYPadding?: number,
		legendLineHeight?: number,
		plotMargins?: PlotMargins,
		showToolstips?: boolean,
		hasOwnProperty?(prop: string): boolean,
		tooltipRadius?: number;
		plotLineWidth?: number;
		maxInformationDensity?: number;
		showMarkerDensity?: number;
		vectorScale?: number;
		scaleUnits?: string;
		scaleLength?: number;
	}

	export interface PlotMargins{
		top?: number,
		right?: number,
		bottom?: number,
		left?: number
	}	
}
export type LineType = {xDate: Date, yNum: number}