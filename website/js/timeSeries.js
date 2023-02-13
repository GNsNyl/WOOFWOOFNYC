// Initialize data
viz1_1_loadData();
let viz1_1_data;

var parseTime = d3.timeParse("%b %d, %Y");


// Load CSV file
function viz1_1_loadData() {
    d3.csv("data/dog_info.csv", row => {
        row.ZipCode = +row.ZipCode;
        // row.AnimalBirthYear = +row.AnimalBirthYear;
        // row.height = +row.height;
        // row.weight = +row.weight;
        // row.longivity = +row.longivity;
        // row['Extract Year'] = +row['Extract Year'];
        // row.LicenseExpiredDate = new Date(row.LicenseExpiredDate);
        row.LicenseIssuedDate = new Date(row.LicenseIssuedDate);

        return row
    }).then(csv => {
        // Store csv data in global variable
        viz1_1_data = csv;
        // Draw the visualization for the first time
        updateVisualization1_1();
    });
}

function updateVisualization1_1(){
    // console.log(viz1_1_data);

    // initialize the monthly area charts
    myTimeSeries = new TimeSeries('viz1_1', viz1_1_data);

}


/* * * * * * * * * * * * * *
*       Button             *
* * * * * * * * * * * * * */


let button_chart_value = 'All';

// getting the button value and update all the charts
function displayRadioValue() {
    let button_chart = document.getElementsByName('borough');

    for (i = 0; i < button_chart.length; i++) {
        if (button_chart[i].checked)
            button_chart_value = button_chart[i].value;
    }

    myTimeSeries.wrangleDataStatic();
    console.log(button_chart_value);
}


/* * * * * * * * * * * * * *
*       Time Series         *
* * * * * * * * * * * * * */


class TimeSeries {

    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = [];
        this.parseDate = d3.timeParse("%m/%d/%Y");

        // call method initVis
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.displayData = vis.data;

        // setting the margin
        vis.margin = {top: 100, right: 100, bottom: 100, left: 100};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // clip path
        vis.svg.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.width)
            .attr("height", vis.height);


        // wrangle data
        vis.filteredData = [];
        let data_count = 0;

        for (let i=1; i<vis.data.length; i++){

            if (vis.data[i-1].LicenseIssuedDate.getTime() === vis.data[i].LicenseIssuedDate.getTime()){
                data_count ++;
            } else{
                vis.filteredData.push(
                    {
                        date: vis.data[i].LicenseIssuedDate,
                        'count': data_count,
                    })
                data_count = 0;
            }
        }


        console.log("filtered data: ", vis.filteredData)
        console.log("original data: ", vis.data)

        vis.x = d3.scaleTime()
            .domain(d3.extent(vis.filteredData, function(d) { return d.date; }))
            .range([ 0, vis.width ]);
        vis.svg.append("g")
            .attr("transform", `translate(0,${vis.height})`)
            .classed('axis', true)
            .call(d3.axisBottom(vis.x).ticks(10));

        vis.y = d3.scaleLinear()
            .range([ vis.height, 0 ]);

        vis.yAxis = vis.svg.append("g")
            .classed('axis', true)
            .call(g => g.select(".domain").remove());


        vis.area = d3.area();
        vis.chart = vis.svg.append("path");

        vis.area
            .x(function(d) { return vis.x(d.date); })
            .y0(vis.height)
            .y1(function(d) { return vis.y(d.count); })
            // .curve(d3.curveStep);


        // creating the text for tooltip
        vis.svg.append('g').append('text').classed('tooltip_chart_text', true);


        // gradient color scale
        //https://www.freshconsulting.com/insights/blog/d3-js-gradients-the-easy-way/
        vis.gradient = vis.svg.append("linearGradient")
            .attr("id", "svgGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "100%");

        vis.gradient.append("stop")
            .attr("class", "start")
            .attr("offset", "0%")
            .attr("stop-color", "rgba(0,255,225,1.0)")
            .attr("stop-opacity", 1);

        vis.gradient.append("stop")
            .attr("class", "end")
            .attr("offset", "100%")
            .attr("stop-color", "rgba(165,82,255,1.0)")
            .attr("stop-opacity", 1);


        this.wrangleDataStatic();

    }
    wrangleDataStatic() {
        let vis = this;

        vis.updatedData = [];
        vis.filteredData2 = [];
        let data_count2 = 0;

        if (button_chart_value != 'All'){
            for (let i=0; i<vis.data.length; i++){
                if (vis.data[i].Borough === button_chart_value){

                    vis.updatedData.push(
                        {
                            date: vis.data[i].LicenseIssuedDate,
                            borough: vis.data[i].Borough,
                            neighbourhood: vis.data[i].Neighborhood,
                            zipcode: vis.data[i].ZipCode,
                        })
                }
            }

            for (let i=1; i<vis.updatedData.length; i++){

                if (vis.updatedData[i-1].date.getTime() === vis.updatedData[i].date.getTime()){
                    data_count2++;
                } else{
                    vis.filteredData2.push(
                        {
                            date: vis.updatedData[i].date,
                            'count': data_count2,
                        })
                    data_count2 = 0;
                }
            }
            vis.y.domain([0, 100])
        }else{
            vis.filteredData2 = vis.filteredData;
            vis.y.domain([0, d3.max(vis.filteredData, d => d.count)])
        }

        console.log("filtered data: ", vis.filteredData2);
        // console.log("updated data: ", vis.updatedData);

        this.updateVis();
    }

    updateVis(){
        let vis = this;


        vis.yAxis
            .call(d3.axisLeft(vis.y).ticks(5))
            .call(g => g.select(".domain").remove());

        vis.chart.datum(vis.filteredData2)
            .attr("class", "area")
            .attr("d", vis.area)
            .attr('stroke-width', 0.25)
            .attr("stroke-opacity", 1.0)
            // .attr("stroke", "rgba(255,255,255,0.9)")
            .attr("stroke", "url(#svgGradient)")
            .attr("fill", "none")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            // .on('mousemove', function(event, d) {
            //     let mouse = d3.pointer(event);
            //     // console.log(d)
            //     // adding the tooltip text
            //     vis.svg.selectAll('.tooltip_chart_text')
            //         .data(vis.filteredData2)
            //         .style("opacity", 1)
            //         .text("hi")
            //         .attr("x", mouse[0])
            //         .attr("y", vis.height - 15)
            //         .attr('alignment-baseline', 'alphabetic')
            //         // .attr('text-anchor','end')
            //         .attr('fill', 'rgb(255,255,255)')
            //
            // })


    }

}