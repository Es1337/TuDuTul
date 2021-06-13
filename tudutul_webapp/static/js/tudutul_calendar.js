var today = new Date();

function getMonthFromString(mon){
    return new Date(Date.parse(mon +" 1, 2012")).getMonth()+1;
}

function daysInMonth (month, year) {
    return new Date(year, month, 0).getDate();
}

function getDayInMonth(day){
    if(day < 10) { return "0"+day; }
    else { return "" + day; }
}

var day = String(today.getDate()).padStart(2, '0');
var month = String(today.getMonth() + 1).padStart(2, '0');
var year = today.getFullYear();


const getFromLocalStorage = date => {
    const reference = localStorage.getItem(date);
  
    if (reference) {
        // convert back from JSON into array
        toDoList = JSON.parse(reference);
    } else {
        toDoList = [];
    }
    console.log("GETTING FROM LOCAL STORAGE");
    return toDoList;
}


// const getMonthlyTodos = month => {
//     var current_day = [year, month, "01"].join('-');
//     var days = daysInMonth(month, year);

//     // current_day = [year, getDayInMonth(month), getDayInMonth(8)].join('-');
//     // console.log(current_day);
//     // dailyTodos = getFromLocalStorage(current_day);
//     // console.log("Loading daily Todos...");
//     // console.log(dailyTodos);
//     for (let i=1; i<=days; i++){
//         current_day = [year, getDayInMonth(month), getDayInMonth(i)].join('-');
//         console.log(current_day);
//         dailyTodos = getFromLocalStorage(current_day);
//         // console.log("Loading daily Todos...");
//         if (dailyTodos.length > 0){
//             // console.log(dailyTodos);
//             for (let j=0; j<dailyTodos.length; j++){
//                 current_event = {
//                     id: "" + j + i + month + year,
//                     name: dailyTodos[j].name,
//                     description: dailyTodos[j].content,
//                     badge: "Priorytet: " + dailyTodos[j].priority,
//                     date: dailyTodos[j].creation_date,
//                     type: "personal", // dailyTodos[j].category
//                 }
//                 console.log(current_event);
//             }
//         }
//     }
// }


$(document).ready(function() {
    $('#demoEvoCalendar').evoCalendar({
        format: "MM dd, yyyy",
        titleFormat: "MM"
        // ,
        // calendarEvents: [ {
        //     id: "asdfgh1",
        //     name: "Personal",
        //     description: "Masz 3 zadania z kategorii Personal w tym dniu.",
        //     badge: "niewykonane",
        //     date: today,
        //     type: "Personal",
        // }, {
        //     id: "artyu2",
        //     name: "Personal",
        //     description: "Masz 2 zadania z kategorii Personal w tym dniu.",
        //     badge: "niewykonane",
        //     date: "June/10/2021",
        //     type: "Family",
        // }, {
        //     id: "artyu2",
        //     name: "Work",
        //     description: "Masz 2 zadania z kategorii Work w tym dniu.",
        //     badge: "niewykonane",
        //     date: today,
        //     type: "Work",
        // } ]

    });

    var curDate = $("#demoEvoCalendar").evoCalendar("getActiveDate");
    var dateFormat = curDate.split(" ");
    var month = getMonthFromString(dateFormat[0]);
    var year = dateFormat[2];
    var days = daysInMonth(month, year);

    for (let i=1; i<=days; i++){
        current_day = [year, getDayInMonth(month), getDayInMonth(i)].join('-');
        dailyTodos = getFromLocalStorage(current_day);
        
        if (dailyTodos.length > 0) {
            for (let j=0; j<dailyTodos.length; j++){
                current_event = {
                    id: "" + j + i + month + year,
                    name: dailyTodos[j].name,
                    description: dailyTodos[j].content,
                    badge: "Priorytet: " + dailyTodos[j].priority,
                    date: dailyTodos[j].creation_date,
                    type: dailyTodos[j].category,
                }
                var eventExists = $("#demoEvoCalendar").evoCalendar("selectCalendarEvent", current_event);
                if (!eventExists) {
                    $("#demoEvoCalendar").evoCalendar("addCalendarEvent", current_event);
                }
            }
        }
    }
    

    $("#demoEvoCalendar").click(function() {
        var curDate = $("#demoEvoCalendar").evoCalendar("getActiveDate");
        var dateFormat = curDate.split(" ");
        var month = getMonthFromString(dateFormat[0]);
        var month = $("#demoEvoCalendar").evoCalendar("getCurrentMonth");
        var year = dateFormat[2];
        var days = daysInMonth(month, year);

        for (let i=1; i<=days; i++){
            current_day = [year, getDayInMonth(month), getDayInMonth(i)].join('-');
            dailyTodos = getFromLocalStorage(current_day);
            
            if (dailyTodos.length > 0) {
                console.log(dailyTodos);
                for (let j=0; j<dailyTodos.length; j++){

                    current_event = {
                        id: "" + j + i + month + year,
                        name: dailyTodos[j].name,
                        description: dailyTodos[j].content,
                        badge: "Priorytet: " + dailyTodos[j].priority,
                        date: dailyTodos[j].creation_date,
                        type: dailyTodos[j].category,
                    }
                    console.log(current_event.id);

                    var eventExists = $("#demoEvoCalendar").evoCalendar("selectCalendarEvent", current_event);
                    console.log(eventExists);
                    if (!eventExists) {
                        $("#demoEvoCalendar").evoCalendar("addCalendarEvent", current_event);
                    }

                }
            }
        }

    });
    

    $("#showDateBtn").click(function() {
        var curDate = $("#demoEvoCalendar").evoCalendar("getActiveDate");
        if (curDate) $("#showDateBtn").prop("disabled", !1);
        var dateFormat = curDate.split(" ");
        var month = getMonthFromString(dateFormat[0]);
        var day = dateFormat[1].substring(0, dateFormat[1].length - 1);
        var year = dateFormat[2];
        if(month < 10) month = '0' + month;
        var fullDate = [year, month, day].join('-');

        window.location.href = window.location.href.replace("/calendar", "?date=" + fullDate);
    });


    $("#cancelBtn").click(function() {
        window.history.back();
    });


})
