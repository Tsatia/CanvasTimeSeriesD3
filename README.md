# CanvasTimeSeriesD3
Drawing large data set using D3 ^V4 base on a D3 V3
###Consider the followings while updating from D3 V3 to D3 ^V4

* V3
```javascript
this.xAxis = d3.svg.axis()
		.scale(this.xScale)
        .orient("bottom")
```

* Equivalent code in ^V4
```javascript
this.xAxis = d3.axisBottom(this.xScale)
```