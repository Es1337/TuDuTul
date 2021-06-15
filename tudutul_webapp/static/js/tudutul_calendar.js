var today = new Date();
var day = String(today.getDate()).padStart(2, '0');
var month = String(today.getMonth() + 1).padStart(2, '0');
var year = today.getFullYear();

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

function loadCalendar() {
    var curDate = $("#demoEvoCalendar").evoCalendar("getActiveDate");
    var dateFormat = curDate.split(" ");
    var month = $("#demoEvoCalendar").evoCalendar("getCurrentMonth");
    var year = dateFormat[2];
    var days = daysInMonth(month, year);

    for (let i=1; i<=days; i++){
        current_day = [year, getDayInMonth(month), getDayInMonth(i)].join('-');
        dailyTodos = getFromLocalStorage(current_day);
        console.log(current_day);
        
        if (dailyTodos.length > 0) {
            for (let j=0; j<dailyTodos.length; j++){

                current_event = {
                    id: "" + j + i + month + year,
                    name: dailyTodos[j].name,
                    description: dailyTodos[j].content,
                    badge: "Priorytet: " + dailyTodos[j].priority,
                    date: current_day,
                    type: dailyTodos[j].category,
                }

                var eventExists = $("#demoEvoCalendar").evoCalendar("selectCalendarEvent", current_event);
                if (!eventExists) {
                    $("#demoEvoCalendar").evoCalendar("addCalendarEvent", current_event);
                }

            }
        }
    }

}

$(document).ready(function() {
    $('#demoEvoCalendar').evoCalendar({
        format: "MM dd, yyyy",
        titleFormat: "MM"
    });
    
    loadCalendar();

    $("#demoEvoCalendar").click(function() { 
        loadCalendar();
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
