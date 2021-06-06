var today = new Date();

function getMonthFromString(mon){
    return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1
 }

$(document).ready(function() {
    $('#demoEvoCalendar').evoCalendar({
        format: "MM dd, yyyy",
        titleFormat: "MM"
//        , calendarEvents: [ {
//            id: "asdfgh1",
//            name: "Personal",
//            description: "Masz 3 zadania z kategorii Personal w tym dniu.",
//            badge: "niewykonane",
//            date: today,
//            type: "personal",
//        }, {
//            id: "artyu2",
//            name: "Personal",
//            description: "Masz 2 zadania z kategorii Personal w tym dniu.",
//            badge: "niewykonane",
//            date: "June/10/2021",
//            type: "personal",
//        }, {
//            id: "artyu2",
//            name: "Work",
//            description: "Masz 2 zadania z kategorii Work w tym dniu.",
//            badge: "niewykonane",
//            date: today,
//            type: "work",
//        } ]
    })

    $("#showDateBtn").click(function() {
        var curDate = $("#demoEvoCalendar").evoCalendar("getActiveDate");
        if (curDate) $("#showDateBtn").prop("disabled", !1);
        var dateFormat = curDate.split(" ");
        var month = getMonthFromString(dateFormat[0]);
        var day = dateFormat[1].substring(0, dateFormat[1].length - 1);
        var year = dateFormat[2];
        if(month < 10) month = '0' + month;
        // console.log("Month: " + month + " Day: " + day + " year: " + year);

        var fullDate = year + '-' + month + '-' + day;
        // console.log("Full date is: " + fullDate);

        window.location.href = window.location.href.replace("/calendar", "?date=" + fullDate);
    });


    $("#cancelBtn").click(function() {
        window.history.back();
    });
  })