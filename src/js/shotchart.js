
const width = 800
const height = 500
const scale = 10
const center_x = width / 2
const center_y = 7 * height / 8
const offset_label = 10
const radius = 50
const line_thickness = 3

function draw_shot_chart(positions, adjust_position) {

    $('#svg_shots').empty()
    $('#svg_court').empty()
    const svg_shots = d3.select('#svg_shots')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)
    const svg_court = d3.select('#svg_court')
                    .append('svg')
                    .attr('width', width)
                    .attr('height', height)

    // basket
    const width_board = 80
    const y_board = center_y - 40
    draw_line(svg_court,    { x: center_x - width_board / 2, y: y_board }, 
                            { x: center_x + width_board / 2, y: y_board })
    draw_circle(svg_court, center_x, y_board - 15, 12)

    const width_zone = 160
    const height_zone = 190
    const height_baseline = y_board + 40
    draw_rect(svg_court, center_x - width_zone / 2, height_baseline - height_zone, width_zone, height_zone)
    
    draw_arc(svg_court, center_x, center_y - 42, radius, -Math.PI / 2, Math.PI / 2, false)

    draw_arc(svg_court, center_x, height_baseline - height_zone, width_zone / 3, -Math.PI / 2, Math.PI / 2, false)
    draw_arc(svg_court, center_x, height_baseline - height_zone, width_zone / 3, Math.PI / 2,  3 * Math.PI / 2, true)

    const width_baseline = 500
    draw_line(svg_court,    { x: center_x - width_baseline / 2, y: height_baseline }, 
                            { x: center_x + width_baseline / 2, y: height_baseline })
    
    const width_3pt = 430
    const height_3pt = 150
    draw_line(svg_court,    { x: center_x - width_3pt / 2, y: height_baseline }, 
                            { x: center_x - width_3pt / 2, y: height_baseline - height_3pt })
    draw_line(svg_court,    { x: center_x + width_3pt / 2, y: height_baseline }, 
                            { x: center_x + width_3pt / 2, y: height_baseline - height_3pt })
    draw_arc(svg_court, center_x, height_baseline - 50,  2.75 * width_3pt / 5, -Math.PI / 2.75, Math.PI / 2.75, false)

    // background
    svg_court.append('rect')
        .attr('x', center_x - width_baseline / 2)
        .attr('y', height_baseline - height)
        .attr('width', width_baseline)
        .attr('height', height)
        .attr('fill', '#6f6fff')
        .lower()

    // shot locations for years 2020-2022 are flawed (newly computed in shotchart.js)
    x_adjustment = 1
    y_adjustment = 1
    if (adjust_position) {
        x_adjustment = 10
        y_adjustment = 10
    }

    // shots
    svg_shots.selectAll('circle')
            .data(positions)
            .enter()
            .append('circle')
            .attr('cx', function(d) { 
                const cx = center_x + d.x * scale * x_adjustment
                return cx
            })
            .attr('cy', function(d) { 
                const correction_y = (y_adjustment > 1) ? (y_adjustment - 1) * 59 : 0 // for flawed shot locations (2020-2022)
                const cy = center_y - d.y * scale * y_adjustment + correction_y
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
                const x_label = center_x + d.x * scale * x_adjustment
                const correction_y = (y_adjustment > 1) ? (y_adjustment - 1) * 59 : 0 // for flawed shot locations (2020-2022)
                const y_label = center_y - d.y * scale * y_adjustment + correction_y
                d3.select(this.parentNode)
                .append('text')
                .text(d.time)
                .attr('class', 'label')
                .attr('x', x_label + offset_label) 
                .attr('y', y_label - offset_label) 
                .style('display', 'block') 
            })
            .on('mouseleave', function(event, d) { d3.select('.label').remove() })
                    
    
    const svg_scale = 1.5
    svg_shots.attr('transform',  `scale(${svg_scale})`)
    svg_court.attr('transform',  `scale(${svg_scale})`)

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
    svg.selectAll('circles')
        .data([{ x: x, y: y }])
        .enter()
        .append('circle')
        .attr('cx', function (d) { return d.x })
        .attr('cy', function (d) { return d.y })
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