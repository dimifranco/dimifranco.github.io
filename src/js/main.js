function init_page() {
    // initializes select fields
    $(function () {
        $.getJSON("../../data/shots/info.json", function(data) {
            seasons = Object.keys(data).reverse()
            for (season of seasons) {
                $("#season_selector").append($('<option>', {
                    value: season,
                    text: season
                }))
            }
            
            update_dates($("#season_selector").val(), data)
        })
    })

    // update the select fields on change
    $(function () {
        $("#season_selector").on('change', function () {
            const season = $("#season_selector").val()
            update_dates(season, null)
        })
        $("#date_selector").on('change', function () {
            const season = $("#season_selector").val()
            const date = $("#date_selector").val()
            update_games(season, null)
        })
        $("#game_selector").on('change', function () {
            update_page(true)
        })
        $("#player_selector").on('change', function () {
            update_page(false)
        })
    })
}

function update_dates(season, data) {
    if (data == null) {
        $.getJSON("../../data/shots/info.json", function(data) {
            update_dates(season, data)
        })
        return
    }

    // remove old entries
    $("#date_selector").empty()

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    dates = Object.keys(data[season]).sort() // TODO: sort by month then date
    for (date of dates) {
        parts = date.split("-")
        date_object = new Date(parts[2], parts[0] - 1, parts[1])
        $("#date_selector").append($('<option>', {
            value: date, 
            text: months[date_object.getMonth()] + ' ' + date_object.getDate() + ' ' + date_object.getFullYear()
        }))
    }

    update_games(season, data)
}

function update_games(season, data) {
    if (data == null) {
        $.getJSON("../../data/shots/info.json", function(data) {
            update_games(season, data)
        })
        return
    }

    // remove old entries
    $("#game_selector").empty()

    date = $("#date_selector").val()
    games = data[season][date]
    for (game of games) {
        first_team = game[0].split(/(?=[A-Z])/).join(' ')
        second_team = game[1].split(/(?=[A-Z])/).join(' ')
        $("#game_selector").append($('<option>', {
            value: game[0] + '_' + game[1],
            text: first_team + ' vs ' + second_team
        }))
    }

    update_page(true)
}

function update_page(select_name) {
    season_selected = $("#season_selector").val()
    date_selected = $("#date_selector").val()
    game_selected = $("#game_selector").val()
    player_selected = $("#player_selector").val()
    url = '../../data/shots/' + season_selected + '/' + game_selected + '_' + date_selected + '.csv'
    update_players(url, player_selected, select_name)
}


function update_players(url, player_selected, select_name) {
    $.ajax({
        url: url,
        async: false,
        success: function (csvd) {
            shots = $.csv.toObjects(csvd)
            
            var players = new Set()
            for (shot of shots) {
                players.add(shot.PLAYER_NAME)
            }

            $("#player_selector").empty()
            for (player of players) {
                $("#player_selector").append($('<option>', {
                    value: player,
                    text: player
                }))
            }
            if (select_name) {
                player_selected = Array.from(players)[0]
            }
            $("#player_selector").val(player_selected)
            
            // draw
            positions = []
            player_id = -1
            for (shot of shots) {
                if (shot.PLAYER_NAME == player_selected) {
                    sec = shot.SECS_LEFT
                    min = shot.MINS_LEFT
                    quarter = shot.QUARTER
                    time = min + ':' + sec + ' (' + ((quarter <= 4) ? (quarter + '. Quarter') : ((quarter - 4) + '. Overtime')) + ')'
                    $("#button_player_game_statistics").val(shot.PLAYER_ID) // TODO only once 
                    positions.push({'x': parseFloat(shot.LOC_X), 
                                    'y': parseFloat(shot.LOC_Y), 
                                    'shot_made': shot.SHOT_MADE == 'True',
                                    'distance': shot.SHOT_DISTANCE + ' ft',
                                    'time': time,
                                    'shot_type': shot.ACTION_TYPE,
                                    'zone': shot.BASIC_ZONE,
                                    'id': shot.PLAYER_ID
                                    })
                }
            }

            // shot locations for years 2020-2022 are flawed (newly computed in shotchart.js)
            years = ['2022', '2021', '2020']
            regex = /\/(\d{4})\//
            year = regex.exec(url)[1]
            
            draw_shot_chart(positions, years.includes(year))
        },
        dataType: "text",
        complete: function () {
            console.log('Loaded game file successfully.')
        }
    })
}

init_page()

// TODO: disable before deployment
/*
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function debug_selector() {
    $("#season_selector").val('2021')
    update_dates('2021', null)
    await sleep(100)
    $("#date_selector").val('01-03-2021')
    update_games('2021', null)
    await sleep(100)
    $("#game_selector").val('PortlandTrailBlazers_GoldenStateWarriors')
    update_page(false)
    await sleep(100)
    $("#player_selector").val('Stephen Curry')
    update_page(false)
}

setTimeout(debug_selector, 100)
*/
