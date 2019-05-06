"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var d3 = __importStar(require("d3"));
var CanvasTimeSeriesPlot = /** @class */ (function () {
    function CanvasTimeSeriesPlot(parentElement, canvasDimensions, config) {
        if (config === void 0) { config = {}; }
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
        this.xTicksPerPixel = config.xTicksPerPixel || 1.0 / 92.0;
        this.yTicksPerPixel = config.yTicksPerPixel || 1.0 / 40.0;
        this.minCanvasWidth = config.minCanvasWidth || 250;
        this.minCanvasHeight = config.minCanvasHeight || 150;
        this.legendMargin = config.legendMargin || 10;
        this.legendXPadding = config.legendXPadding || 5;
        this.legendYPadding = config.legendYPadding || 6;
        this.legendLineHeight = config.legendLineHeight || 11;
        this.margin = config.plotMargins || { top: 20, right: 20, bottom: (this.xAxisLabelText.length > 0 ? 60 : 30),
            left: (this.yAxisLabelText.length > 0) ? 65 : 50 };
        this.totalWidth = Math.max(this.minCanvasWidth, canvasDimensions[0]);
        this.totalHeight = Math.max(this.minCanvasHeight, canvasDimensions[1]);
        this.width = this.totalWidth - this.margin.left - this.margin.right;
        this.height = this.totalHeight - this.margin.top - this.margin.bottom;
        this.informationDensity = [];
        this.plotLineWidth = config.plotLineWidth || 1;
        this.maxInformationDensity = config.maxInformationDensity || 2.0;
        this.showMarkerDensity = config.showMarkerDensity || 0.14;
        this.div = this.parent.append("div")
            .attr("class", "cvpChart")
            .style("width", this.totalWidth + "px")
            .style("height", this.totalHeight + "px");
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
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis);
        if (this.xAxisLabelText.length > 0) {
            this.xAxisLabel = this.svgTranslateGroup.append("text")
                .attr("class", "cvpLabel")
                .attr("x", Math.round(0.5 * this.width))
                .attr("y", this.height + 40)
                .attr("text-anchor", "middle")
                .text(this.xAxisLabelText);
        }
        if (this.yAxisLabelText.length > 0) {
            this.yAxisLabel = this.svg.append("text")
                .attr("class", "cvpLabel")
                .attr("x", Math.round(-0.5 * this.height - this.margin.top))
                .attr("y", 15)
                .attr("transform", "rotate(-90)")
                .attr("text-anchor", "middle")
                .text(this.yAxisLabelText);
        }
        this.drawCanvas();
    }
    // Constructor ends here
    CanvasTimeSeriesPlot.prototype.addDataSet = function (uniqueID, label, dataSet, colorString, updateDomains, copyData) {
        this.informationDensity.push(1);
        this.dataIDs.push(uniqueID);
        this.dataLabels.push(label);
        this.dataColors.push(colorString);
        this.displayIndexStart.push(0);
        this.displayIndexEnd.push(0);
        dataSet = dataSet || [];
        if (copyData) {
            var dataIndex = this.data.length;
            this.data.push([]);
            var dataSetLength = dataSet.length;
            for (var i = 0; i < dataSetLength; ++i) {
                this.data[dataIndex].push(__assign({}, dataSet[i]));
            }
        }
        else {
            // append data to the existing ones
            this.data.push(dataSet);
        }
        this.updateLegend();
        if (updateDomains) {
            this.updateDomains(this.calculateXDomain(), this.calculateYDomain(), true);
        }
        else {
            this.updateDisplayIndices();
            this.drawCanvas();
        }
    };
    CanvasTimeSeriesPlot.prototype.updateLegend = function () {
        var _this = this;
        if (this.disableLegend) {
            return;
        }
        if (this.legend) {
            this.legend.remove();
            this.legend = null;
            this.legendWidth = 0;
        }
        if (this.data.length == 0) {
            return;
        }
        this.legend = this.svgTranslateGroup.append("g")
            .attr("class", "cvpLegend")
            .attr("transform", "translate(" + (this.width + this.margin.right + 1) + ", " + this.legendMargin + ")");
        this.legendBG = this.legend.append("rect")
            .attr("class", "cvpLegendBG")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 250)
            .attr("height", this.legendYPadding + this.dataLabels.length * (this.legendYPadding + this.legendLineHeight) - 1);
        var maxTextLen = 0;
        this.dataLabels.forEach(function (s, i) {
            _this.legend.append("rect")
                .attr("x", _this.legendXPadding)
                .attr("y", _this.legendYPadding + i * (_this.legendYPadding + _this.legendLineHeight))
                .attr("width", _this.legendLineHeight)
                .attr("height", _this.legendLineHeight)
                .attr("fill", _this.dataColors[i])
                .attr("stroke", "none");
            var textElem = _this.legend.append("text")
                .attr("x", 2 * _this.legendXPadding + _this.legendLineHeight - 1)
                .attr("y", _this.legendYPadding + _this.legendLineHeight + i * (_this.legendYPadding + _this.legendLineHeight) - 1)
                .text(_this.dataLabels[i].length > 0 ? _this.dataLabels[i] : _this.dataIDs[i]);
            maxTextLen = Math.max(maxTextLen, textElem.node().getComputedTextLength());
        });
        this.legendWidth = 3 * this.legendXPadding + this.legendLineHeight + maxTextLen - 1;
        this.legendBG.attr("width", this.legendWidth);
        this.legend.attr("transform", "translate(" + (this.width - this.legendWidth - this.legendMargin) + ", " + this.legendMargin + ")");
    };
    CanvasTimeSeriesPlot.prototype.updateDomains = function (arg0, arg1, arg2) {
        throw new Error("Method not implemented.");
    };
    CanvasTimeSeriesPlot.prototype.calculateXDomain = function () {
        if (this.data.length <= 1) {
            // this are just some default values to make it look nice in case of empty values.
            return [new Date(2017, 0, 1), new Date(2020, 0, 1)];
        }
        var minMaxHolder = [];
        this.data.forEach(function (dataSet) {
            var tupel = (d3.extent(dataSet, function (d) { return d.xDate; }));
            minMaxHolder.push(tupel[0]);
            minMaxHolder.push(tupel[1]);
        });
        return d3.extent(minMaxHolder, function (d) { return d; });
    };
    CanvasTimeSeriesPlot.prototype.calculateYDomain = function () {
        var minMaxHolder = [];
        this.data.forEach(function (dataSet) {
            var tupel = (d3.extent(dataSet, function (d) { return d.yNum; }));
            minMaxHolder.push(tupel[0]);
            minMaxHolder.push(tupel[1]);
        });
        return d3.extent(minMaxHolder, function (d) { return d; });
    };
    CanvasTimeSeriesPlot.prototype.updateDisplayIndices = function () {
        throw new Error("Method not implemented.");
    };
    CanvasTimeSeriesPlot.prototype.setupXScaleAndAxis = function () {
        this.xScale = d3.scaleTime()
            .domain(this.calculateXDomain())
            .rangeRound([0, this.width])
            .nice()
            .clamp(true);
        var formatMilliSecond = d3.timeFormat(".%L"), formatSecond = d3.timeFormat(":%S"), formatHour = d3.timeFormat("%I:%p"), formatWeek = d3.timeFormat("%b %d"), formatMonth = d3.timeFormat("%B"), formatYear = d3.timeFormat("%Y");
        var multiFormat = function (date) {
            return (d3.timeSecond(date) < date ? formatMilliSecond
                : d3.timeMinute(date) < date ? formatSecond
                    : d3.timeDay(date) < date ? formatHour
                        : d3.timeWeek(date) < date ? formatWeek
                            : d3.timeYear(date) < date ? formatMonth
                                : formatYear)(date);
        };
        var xFormat = "%d-%b-%y";
        this.xAxis = d3.axisBottom(this.xScale)
            // .tickFormat(multiFormat)
            .tickFormat(d3.timeFormat(xFormat));
        // .ticks(d3.timeDay.every(4))
    };
    CanvasTimeSeriesPlot.prototype.setupYScaleAndAxis = function () {
        this.yScale = d3.scaleLinear()
            .domain(this.calculateYDomain())
            .rangeRound(this.invertYAxis ? [0, this.height] : [this.height, 0])
            .nice()
            .clamp(true);
        this.yAxis = d3.axisLeft(this.yScale)
            .ticks(Math.round(this.yTicksPerPixel * this.height));
    };
    CanvasTimeSeriesPlot.prototype.drawCanvas = function () {
        this.canvas.clearRect(0, 0, this.width, this.height);
        this.drawGrid();
        var nDataSets = this.data.length;
        for (var i = 0; i < nDataSets; ++i) {
            this.drawDataSet(i);
        }
    };
    CanvasTimeSeriesPlot.prototype.drawGrid = function () {
        this.canvas.lineWidth = 0.9;
        this.canvas.strokeStyle = this.gridColor;
        this.canvas.beginPath();
        for (var i = 1; i <= Math.floor(this.width); i++) {
            var x = (i * 10);
            this.canvas.moveTo(0, x);
            this.canvas.lineTo(this.width, x);
        }
        for (var j = 1; j <= Math.floor(this.height); j++) {
            var y = (j * 10);
            this.canvas.moveTo(y, 0);
            this.canvas.lineTo(y, this.height);
        }
        this.canvas.stroke();
        this.canvas.closePath();
    };
    CanvasTimeSeriesPlot.prototype.drawDataSet = function (dataIndex) {
        var d = this.data[dataIndex];
        if (d == null) {
            return;
        }
    };
    return CanvasTimeSeriesPlot;
}());
