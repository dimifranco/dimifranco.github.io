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
            update_page()
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

    update_page()
}

function update_page() {
    season_selected = $("#season_selector").val()
    date_selected = $("#date_selector").val()
    game_selected = $("#game_selector").val()
    url = '../../data/shots/' + season_selected + '/' + game_selected + '_' + date_selected + '.csv'
    update_players(url)
}


function update_players(url) {
    $.ajax({
        url: url,
        async: false,
        success: function (csvd) {
            shots = $.csv.toObjects(csvd)
            //console.log(shots)
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
        },
        dataType: "text",
        complete: function () {
            console.log('Loaded game file successfully.')
        }
    })
}

init_page()
