const margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#link")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        `translate(${margin.left}, ${margin.top})`);



d3.json("data/package.json").then( function(data) {

    const size = d3.scaleLinear()
        .domain([-1700, 2200])
        .range([0, width])

    // Initialize the links
    const link = svg
        .selectAll("line")
        .data(data.links)
        .join("line")
        .style("stroke", "#ffffff")

    // Initialize the nodes
    const node = svg
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", 2)
        .style("fill", "#b5c5c2")

    // Let's list the force we wanna apply on the network
    const simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
        .force("link", d3.forceLink()                               // This force provides links between nodes
            .id(function (d) {
                return d.id;
            })                     // This provide  the id of a node
            .links(data.links)                                    // and this the list of links
        )
        .force("charge", d3.forceManyBody().strength(-400))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
        .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
        .on("end", ticked);

    // This function is run at each iteration of the force algorithm, updating the nodes position.
    function ticked() {
        link
            .attr("x1", function (d) {
                // console.log(d.source);
                // console.log(size(d.source.x));
                console.log(d.source.x);
                return size(d.source.x);
            })
            .attr("y1", function (d) {
                console.log(d.source.y);
                return size(d.source.y);
            })
            .attr("x2", function (d) {
                console.log(d.target.x);
                return size(d.target.x);
            })
            .attr("y2", function (d) {
                console.log(d.target.y);
                return size(d.target.y);
            });

        node
            .attr("cx", function (d) {
                return size(d.x) + 6;
            })
            .attr("cy", function (d) {
                return size(d.y) - 6;
            });
    }
})

