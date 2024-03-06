
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
            .delay(function(d, i) { return i * 50 })
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

function search_game_by_field(games, field, date) {
    for (game of games) {
        if (game[field] == date) {
            return game
        }
    }
    return null
}

function draw_game_statistics(data) {
    /*
    TODO: create statistics for the game
    - hits and misses (pie charts: total, 2s, 3s, per quarter, distance/zone, time, longest streak)
    - TODO free throws
    - type of shots (pie chart)

    TODO: profile image
    - seasonal statistics
    - final: ranking per category

    Necessary stats:
    Points, Assists, Rebounds, Blocks, Steals, Turnovers (descending)
    FtPoints, FTA 
    FG2M, FG2A
    FG3M, FG3A 
    Minutes
    */
    $('#svg_player_game_statistics').empty()


    const data_json = $.parseJSON(data)
    
    
    const player_stats_season = data_json.single_row_table_data
    const player_stats_games = data_json.multi_row_table_data

    // filter game by date
    var date = $('#date_selector').val()
    yyyy_mm_dd = date.split('-')
    date = yyyy_mm_dd[2] + '-' + yyyy_mm_dd[0] + '-' + yyyy_mm_dd[1] 
    game = search_game_by_field(player_stats_games, 'Date', date)
    console.log(game)


    const svg_player_game_statistics = d3.select('#svg_player_game_statistics')
                                        .append('svg')
                                        .attr('width', window.innerWidth)
                                        .attr('height', window.innerHeight)
    
    // update empty fields 
    fields = ['FG2M', 'FG2A', 'FG3M', 'FG3A']
    for (field of fields) {
        if (!(field in game)) {
            game[field] = 0
        }
    }

    fg_made = game.FG2M + game.FG3M
    fg_attempted = game.FG2A + game.FG3A
    fg = [
        { label: 'Made', value: fg_made },
        { label: 'Missed', value: fg_attempted - fg_made }
    ]
    fg2 = [
        { label: 'Made', value: game.FG2M },
        { label: 'Missed', value: game.FG2A - game.FG2M }
    ]
    fg3 = [
        { label: 'Made', value: game.FG3M },
        { label: 'Missed', value: game.FG3A - game.FG3M }
    ]

    function get_percentage_label(made , attempted) {
        return  ((made / attempted * 100).toFixed(2)) +  '%'
    }
    
    draw_pie_chart(svg_player_game_statistics, fg, 200, height / 2, 120, 'Field Goals', get_percentage_label(fg_made, fg_attempted), fg_attempted)
    draw_pie_chart(svg_player_game_statistics, fg2, 500, height / 2, 120, '2-Point Field Goals', get_percentage_label(game.FG2M, game.FG2A), game.FG2A)
    draw_pie_chart(svg_player_game_statistics, fg3, 800, height / 2, 120, '3-Point Field Goals', get_percentage_label(game.FG3M, game.FG3A), game.FG3A)
                    
}

            
$('#button_player_game_statistics').on('click', function () {
    year = $('#season_selector').val()
    season = (parseInt(year) - 1) + '-' + (parseInt(year) % 100) 
    player_id = $('#button_player_game_statistics').val()
    $.ajax({
        url: 'https://api.pbpstats.com/get-game-logs/nba?Season=' + season + '&SeasonType=Regular%2BSeason&EntityId=' + player_id + '&EntityType=Player',
        async: false,
        success: function (data) {
            draw_game_statistics(data)
        },
        dataType: 'text',
        complete: function () {
            console.log('Loaded seasonal statistics successfully.')
        }
    })
})



function draw_pie_chart(svg, data, x, y, radius, label, value, total) {
    
    var color = d3.scaleOrdinal()
                    .domain(data.map(function(d) { return d.label }))
                    .range(d3.schemeCategory10)
    var pie = d3.pie()
                    .sort(null)
                    .value(function(d) { return d.value })

    if (total > 0) {
        padding_x = 10
        padding_y = 10
        arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius)
        
        var arcs = svg.selectAll('arc')
                    .data(pie(data))
                    .enter()
                    .append('g')
                    .attr('class', 'arc')
                    .attr('transform', 'translate(' + x + ',' + y + ')')
    
        arcs.append('path')
            .attr('fill', function (d) { return color(d.data.label) })
            .transition()
            .duration(750)
            .attrTween('d', function (b) {
                b.innerRadius = 0
                var i = d3.interpolate({startAngle: 0, endAngle: 0}, b)
                return function(t) { return arc(i(t)) }
              })
        
        arcs.append('text')
            .attr('transform', function(d) {
              var pos = arc.centroid(d)
              var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
              pos[0] = radius * 0.85 * (midAngle < Math.PI ? 1 : -1) + padding_x * (midAngle < Math.PI ? 1 : -1)
              pos[1] = radius * 0.85 * (midAngle < Math.PI ? 1 : -1) + padding_y * (midAngle < Math.PI ? 1 : -1)
              return 'translate(' + pos + ')'
            })
            .attr('dy', '0.35em')
            .attr('text-anchor', function(d) {
              return (d.startAngle + (d.endAngle - d.startAngle) / 2) < Math.PI ? 'start' : 'end'
            })
            .text(function(d) { return d.data.label + ': ' + d.data.value })
      
        arcs.append('line')
            .attr('x1', function(d) { return arc.centroid(d)[0] })
            .attr('y1', function(d) { return arc.centroid(d)[1] })
            .attr('x2', function(d) {
              var pos = arc.centroid(d)
              var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
              pos[0] = radius * 0.85  * (midAngle < Math.PI ? 1 : -1)
              return pos[0]
            })
            .attr('y2', function(d) {
              var pos = arc.centroid(d)
              var midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2
              pos[1] = radius * 0.85 * (midAngle < Math.PI ? 1 : -1)
              return pos[1]
            })
            .attr('stroke', 'black')
    }

    svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', 'middle')
        .text(label  + ': ' + value)
        .style('fill', 'black')

    
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