
/* * * * * * * * * * * * * *
*       Button             *
* * * * * * * * * * * * * */


let button_chart_value_packing = 'All';

// getting the button value and update all the charts
function displayRadioValue_packing() {
    let button_chart = document.getElementsByName('borough');

    for (i = 0; i < button_chart.length; i++) {
        if (button_chart[i].checked)
            button_chart_value_packing = button_chart[i].value;
    }

    console.log(button_chart_value_packing);
}






/* * * * * * * * * * * * * *
*         PACKING           *
* * * * * * * * * * * * * */


const viz1_margin = {top: 0, right: 0, bottom: 0, left: 0};
const viz1_width = document.getElementById('viz2_1').getBoundingClientRect().width - viz1_margin.left - viz1_margin.right;
const viz1_height = document.getElementById('viz2_1').getBoundingClientRect().height - viz1_margin.top - viz1_margin.bottom;

const svg = d3.select('#viz2_1').append("svg")
    .attr("width", viz1_width + viz1_margin.left + viz1_margin.right)
    .attr("height", viz1_height + viz1_margin.top + viz1_margin.bottom)
    .append("g")
    .attr("transform", "translate(" + viz1_margin.left + "," + viz1_margin.top + ")");


// transition
const t = d3.transition()
    .duration(750)
    .ease(d3.easeLinear);



// Initialize data
loadData();
let data;

// Load CSV file
function loadData() {
    d3.csv("data/zipcode_count.csv", row => {
        row.counts = +row.counts;
        return row
    }).then(csv => {
        // Store csv data in global variable
        data = csv;
        // Draw the visualization for the first time
        updateVisualization();
    });
}



function updateVisualization() {
    // console.log(data);

    const size = d3.scaleLinear()
        .domain([0, 4785])
        .range([5,60])  // circle will be between 7 and 55 px wide

    const color = d3.scaleOrdinal()
        .domain(["Manhattan", "Staten Island" , "Bronx" , "Queens", "Brooklyn"])
        .range('white')
        // .range(d3.schemeSet1);

    // create a tooltip
    let rect_tooltip_letter = svg.append('g')
        .append('text')
        .classed('rect_tooltip_letter', true)
        .style("opacity", 0);

    let rect_tooltip = svg.append('g')
        .append('text')
        .classed('rect_tooltip_text', true)
        .style("opacity", 0);

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function(event, d) {
        d3.selectAll('circle').style('opacity', '0.5')
        d3.select(this).style('opacity', '0.9')

        svg.selectAll('.rect_tooltip_letter')
            .style("opacity", 1)
        svg.selectAll('.rect_tooltip_text')
            .style("opacity", 1)

    }
    const mousemove = function(event, d) {
        let mouse = d3.pointer(event);
        console.log(mouse)
        d3.selectAll('circle').style('opacity', '0.5')
        d3.select(this).style('opacity', '0.9')

        svg.selectAll('.rect_tooltip_letter')
            .style("opacity", 1)
            .text(d.counts)
            .attr("x", mouse[0])
            .attr("y", mouse[1])
            .attr('text-anchor','middle')
            .attr('fill', 'rgb(255,255,255)')

        svg.selectAll('.rect_tooltip_text')
            .style("opacity", 1)
            .text(d.Borough + ", " + d.ZipCode)
            .attr("x", mouse[0])
            .attr("y", mouse[1]+15)
            .attr('text-anchor','middle')
            .attr('fill', 'rgb(255,255,255)')

    }
    var mouseleave = function(event, d) {
        d3.selectAll('circle').style('opacity', '1.0')
        svg.selectAll('.rect_tooltip_letter').style("opacity", 0)
        svg.selectAll('.rect_tooltip_text').style("opacity", 0)
    }

    var node = svg.append("g")
        .selectAll("circle")
        .data(data)
        .join("circle")
        .attr("class", "node")
        .attr("r", d => size(d.counts))
        .attr("cx", viz1_width / 2)
        .attr("cy", viz1_height / 2)
        .style("fill", function(d){
            if (d.Borough == "Manhattan"){
                return 'rgba(255,255,255,0.0)';
            }if (d.Borough == "Staten Island"){
                return 'rgba(255,255,255,0.0)';
            }if (d.Borough == "Bronx"){
                return 'rgba(255,255,255,0.0)';
            }if (d.Borough == "Queens"){
                return 'rgba(255,255,255,0.0)';
            }if (d.Borough == "Brooklyn"){
                return 'rgba(255,255,255,0.0)';
            }
        })
        .style("fill-opacity", 0.8)
        .attr("stroke", "white")
        .attr("stroke-dasharray", function(d){
            if (d.Borough == "Manhattan"){
                return 1;
            }if (d.Borough == "Staten Island"){
                return 3;
            }if (d.Borough == "Bronx"){
                return 3;
            }if (d.Borough == "Queens"){
                return 1;
            }if (d.Borough == "Brooklyn"){
                return 1;
            }
        })
        .style("stroke-width", function(d){
            if (d.Borough == "Manhattan"){
                return 10;
            }if (d.Borough == "Staten Island"){
                return 0.5;
            }if (d.Borough == "Bronx"){
                return 0.5;
            }if (d.Borough == "Queens"){
                return 2;
            }if (d.Borough == "Brooklyn"){
                return 3;
            }
        })
        .on("mouseover", mouseover) // What to do when hovered
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .call(d3.drag() // call specific function when circle is dragged
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Features of the forces applied to the nodes:
    const simulation = d3.forceSimulation()
        .force("center", d3.forceCenter().x(viz1_width / 2).y(viz1_height / 2)) // Attraction to the center of the svg area
        .force("charge", d3.forceManyBody().strength(0.1)) // Nodes are attracted one each other of value is > 0
        .force("collide", d3.forceCollide().strength(0.2).radius(function(d){ return (size(d.counts)+10) }).iterations(1)) // Force that avoids circle overlapping

    // Apply these forces to the nodes and update their positions.
    // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
    simulation
        .nodes(data)
        .on("tick", function(d){
            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y)
        });

    // What happens when a circle is dragged?
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(.03).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(.03);
        d.fx = null;
        d.fy = null;
    }


}

function updateColor(){

}