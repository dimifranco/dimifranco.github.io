
const width = 600
const height = 500
const scale = 10
const center_x = width / 2
const center_y = 7 * height / 8
const offset_label = 10
const radius = 50
const line_thickness = 3

function draw_shot_chart(positions, adjust_position) {

    $('#container').empty()
    const svg = d3.select('#container')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
    // background
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#6f6fff')
        .lower()
    
    // basket
    const width_board = 80
    const y_board = center_y - 25
    draw_line(svg,  { x: center_x - width_board / 2, y: y_board }, 
                    { x: center_x + width_board / 2, y: y_board })
    draw_line(svg,  { x: center_x, y: y_board }, 
                    { x: center_x, y: y_board - 15 })
    draw_circle(svg, center_x, y_board - 27, 12)

    const width_zone = 160
    const height_zone = 205
    const height_baseline = y_board + 40
    draw_rect(svg, center_x - width_zone / 2, height_baseline - height_zone, width_zone, height_zone)
    
    draw_arc(svg, center_x, center_y - 42, radius, -Math.PI / 2, Math.PI / 2, false)

    draw_arc(svg, center_x, height_baseline - height_zone, width_zone / 3, -Math.PI / 2, Math.PI / 2, false)
    draw_arc(svg, center_x, height_baseline - height_zone, width_zone / 3, Math.PI / 2,  3 * Math.PI / 2, true)

    const width_baseline = 600
    draw_line(svg,  { x: center_x - width_baseline / 2, y: height_baseline }, 
                    { x: center_x + width_baseline / 2, y: height_baseline })
    
    const width_3pt = 500
    const height_3pt = 150
    draw_line(svg,  { x: center_x - width_3pt / 2, y: height_baseline }, 
                    { x: center_x - width_3pt / 2, y: height_baseline - height_3pt })
    draw_line(svg,  { x: center_x + width_3pt / 2, y: height_baseline }, 
                    { x: center_x + width_3pt / 2, y: height_baseline - height_3pt })
    draw_arc(svg, center_x, height_baseline - 5,  3 * width_3pt / 5 - 11.5, -Math.PI / 3, Math.PI / 3, false)
    
    /*
    TODO: The positions from 2020-2022 are incorrect (or at least falsely scaled)
    => requires manual scaling

    use high-point games as reference
    e.g. 
    2020: Lillard (61) vs. Golden State Warriors
    2021: Curry (62) vs Portland Trailblazers
    2022: Irving (60) vs Orlando Magic
    */
    x_adjustment = 1
    y_adjustment = 1
    if (adjust_position) {
        x_adjustment = 11
        y_adjustment = 8
    }

    // shots
    svg.selectAll('circle')
        .data(positions)
        .enter()
        .append('circle')
        .attr('cx', function(d) { 
            const cx = parseFloat(center_x) + parseFloat(d.x) * scale * x_adjustment
            return cx
        })
        .attr('cy', function(d) { 
            const correction_y = (y_adjustment > 1) ? (y_adjustment - 1) * 55 : 0 
            const cy = parseFloat(center_y) - parseFloat(d.y) * scale * y_adjustment + correction_y
            return cy
        })
        .attr('r', 0)
        .attr('opacity', 0)
        .transition()
        .delay(function(d, i) { return i * 10 })
        .duration(500)
        .attr('r', 5)
        .attr('opacity', 1)
        .style('fill', function(d) { return d.shot_made ? '#35f086' : '#f03535' })
        .selection()
        .on('mouseenter', function(event, d) {
            const x_label = parseFloat(center_x) + parseFloat(d.x) * scale
            const y_label = parseFloat(center_y) - parseFloat(d.y) * scale
            d3.select(this.parentNode)
              .append('text')
              .text(d.time)
              .attr('class', 'label')
              .attr('x', x_label + offset_label) 
              .attr('y', y_label - offset_label) 
              .style('display', 'block') 
        })
        .on('mouseleave', function(event, d) { d3.select('.label').remove() })
    
    const svg_scale = 1
    svg.attr('transform',  `scale(${svg_scale})`)
}

function draw_line(svg, p1, p2) {
    const line_generator = d3.line()
                                .x(d => d.x)
                                .y(d => d.y)

    svg.append('path')
        .attr('d', line_generator([
            { x: p1.x, y: p1.y}, 
            { x: p2.x, y: p2.y}
        ]))
        .attr('stroke', 'black')
        .attr('stroke-width', line_thickness)
        .attr('fill', 'none')
}

function draw_rect(svg, x, y, width, height) {
    svg.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', width)
        .attr('height', height)
        .attr('stroke', 'black')
        .attr('stroke-width', line_thickness)
        .attr('fill', 'none')
}

function draw_circle(svg, x, y, r) {
    svg.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', r)
        .attr('stroke', 'black')
        .attr('stroke-width', line_thickness)
        .attr('fill', 'none')
}

function draw_arc(svg, x, y, r, start, end, stroke) {
    const arc_generator = d3.arc()
        .innerRadius(r)
        .outerRadius(r)
        .startAngle(start)
        .endAngle(end)
    const arc = svg.append('g')
        .attr('transform', `translate(${x},${y})`)
        .append('path')
        .attr('d', arc_generator)
        .attr('stroke', 'black')
        .attr('stroke-width', line_thickness)
        .attr('fill', 'none')
    if (stroke) {
        arc.attr('stroke-dasharray', '7,10')
    }
}