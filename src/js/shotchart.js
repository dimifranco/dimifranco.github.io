
const width = window.innerWidth;
const height = window.innerHeight;
const scale = 12;
const center_x = width / 2
const center_y = height / 2
const offset_label = 10

function drawShotChart(positions) {

    $('#container').empty()
    const svg = d3.select("#container")
                    .append('svg')
                    .attr("width", width)
                    .attr("height", height)

    svg.selectAll("circle")
        .data(positions)
        .enter()
        .append('circle')
        .attr('cx', function(d) { return parseFloat(center_x) + parseFloat(d.x) * scale })
        .attr('cy', function(d) { return parseFloat(center_y) - parseFloat(d.y) * scale })
        .attr('r', 0)
        .attr('opacity', 0)
        .transition()
        .delay(function(d, i) { return i * 50 })
        .duration(500)
        .attr('r', 5)
        .attr('opacity', 1)
        .style("fill", function(d) { return d.shot_made ? '#35f086' : '#f03535'})
        .selection()
        .on('mouseenter', function(event, d) {
            x_label = parseFloat(center_x) + parseFloat(d.x) * scale
            y_label = parseFloat(center_y) - parseFloat(d.y) * scale
            d3.select(this.parentNode)
              .append("text")
              .text(d.time)
              .attr("class", "label")
              .attr("x", x_label + offset_label) 
              .attr("y", y_label - offset_label) 
              .style("display", "block") 
        })
        .on('mouseleave', function(event, d) { d3.select('.label').remove() })
}
