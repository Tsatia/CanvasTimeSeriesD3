import * as d3 from 'd3';
import * as d3Axis from 'd3-axis';

class CanvasTimeSeriesPlot{

    parent: d3.Selection<HTMLElement, {} , HTMLElement , {}>;
	canvasDimensions: Array<number>;
    config: CanvasTimeSeriesPlot.Config;
    plotLineWidth: number;
    maxInformationDensity: number;
	showMarkerDensity: number;
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
    legend: d3.Selection<any, {} , any , {}>; 
    legendWidth: number;
    legendBG: any;
    informationDensity: Array<number> 
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

    // Parameter to draw the axis and labels
	xScale: d3Axis.AxisScale<Date>;
	yScale: d3Axis.AxisScale<number>;
	xAxis: d3Axis.Axis<Date>;
	yAxis: d3Axis.Axis<number>;
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
	        this.informationDensity = [];
	        this.plotLineWidth = config.plotLineWidth || 1;
	        this.maxInformationDensity = config.maxInformationDensity || 2.0;
	        this.showMarkerDensity = config.showMarkerDensity || 0.14;


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
            this.svgTranslateGroup = this.svg.append("g")
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
                  
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


    addDataSet (uniqueID: string, label: string, dataSet: Array<{xDate: Date, yNum: number}>, colorString: string,
        updateDomains: boolean, copyData?: boolean): void{
        this.informationDensity.push(1);		
		this.dataIDs.push(uniqueID);
		this.dataLabels.push(label);
		this.dataColors.push(colorString);
		this.displayIndexStart.push(0);
		this.displayIndexEnd.push(0);
		dataSet = dataSet || []; 
		if(copyData) {
            //clear the list and get new data
            this.data = []
            this.data = dataSet;	
		}else{
            // append data to the existing ones
			dataSet.forEach(elem =>{
				this.data.push(elem);
			});
		}
		this.updateLegend();
		if(updateDomains) {
			this.updateDomains(this.calculateXDomain(), this.calculateYDomain(), true);
		}else{
			this.updateDisplayIndices();
		    this.drawCanvas();
		}
    }
    
    
    updateLegend() {
        if(this.disableLegend){
			return;
		}

		if(this.legend){
			this.legend.remove();
			this.legend = null;
			this.legendWidth = 0;
		}

		if(this.data.length == 0){
			return;
		}

		this.legend = this.svgTranslateGroup.append("g")
			.attr("class", "cvpLegend")
			.attr("transform", "translate("+(this.width + this.margin.right + 1)+", "+this.legendMargin+")");
		this.legendBG = this.legend.append("rect")
			.attr("class", "cvpLegendBG")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 250)
			.attr("height", this.legendYPadding + this.dataLabels.length*(this.legendYPadding+this.legendLineHeight) - 1);

		var maxTextLen = 0;
		this.dataLabels.forEach((s: string, i:number) => {
			this.legend.append("rect")
			.attr("x", this.legendXPadding)
			.attr("y", this.legendYPadding + i*(this.legendYPadding+this.legendLineHeight))
			.attr("width", this.legendLineHeight)
			.attr("height", this.legendLineHeight)
			.attr("fill", this.dataColors[i])
			.attr("stroke", "none");
		var textElem = this.legend.append("text")
			.attr("x", 2*this.legendXPadding + this.legendLineHeight - 1)
			.attr("y", this.legendYPadding + this.legendLineHeight + i*(this.legendYPadding+this.legendLineHeight) - 1)
			.text(this.dataLabels[i].length > 0 ? this.dataLabels[i] : this.dataIDs[i]); 
		maxTextLen = Math.max(maxTextLen, textElem.node().getComputedTextLength());
	});
	this.legendWidth = 3*this.legendXPadding + this.legendLineHeight + maxTextLen - 1;
	this.legendBG.attr("width", this.legendWidth);
	this.legend.attr("transform", "translate("+(this.width - this.legendWidth - this.legendMargin)+", "+this.legendMargin+")");
    }


    updateDomains(arg0: any, arg1: any, arg2: boolean) {
        throw new Error("Method not implemented.");
    }

    calculateXDomain(): Array<Date>{
        if(this.data.length <= 1){
            // this are just some default values to make it look nice in case of empty values.
            return [new Date(2017, 0, 1), new Date(2020, 0, 1)]
		}   		
		return d3.extent(this.data, function(d) { return d.xDate;});
    }

    calculateYDomain(): Array<number> { return d3.extent(this.data, function(d) { return d.yNum;}); }


    updateDisplayIndices() {
        throw new Error("Method not implemented.");
    }


    setupXScaleAndAxis() {
        this.xScale = d3.scaleTime()
        .domain(this.calculateXDomain())
        .rangeRound([0, this.width])
        .nice()
        .clamp(true);
        
        var formatMilliSecond = d3.timeFormat(".%L"),
            formatSecond = d3.timeFormat(":%S"),
            formatHour = d3.timeFormat("%I:%p"),
            formatWeek = d3.timeFormat("%b %d"),
            formatMonth = d3.timeFormat("%B"),
            formatYear = d3.timeFormat("%Y");

        let multiFormat = (date: Date): string =>{
            return (d3.timeSecond(date) < date ? formatMilliSecond
            : d3.timeMinute(date) < date ? formatSecond
            : d3.timeDay(date) < date ? formatHour
            : d3.timeWeek(date) < date ?  formatWeek
            : d3.timeYear(date) < date ? formatMonth
            : formatYear)(date);
        }

        var xFormat = "%d-%b-%y";
        this.xAxis = d3.axisBottom(this.xScale)
        // .tickFormat(multiFormat)
        .tickFormat(d3.timeFormat(xFormat))
        // .ticks(d3.timeDay.every(4))
    }


    setupYScaleAndAxis() {
        this.yScale = d3.scaleLinear()
            .domain(this.calculateYDomain())
            .rangeRound(this.invertYAxis ? [0, this.height] : [this.height, 0])
            .nice()
            .clamp(true);
    
        this.yAxis = d3.axisLeft(this.yScale)
            .ticks(Math.round(this.yTicksPerPixel*this.height));
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