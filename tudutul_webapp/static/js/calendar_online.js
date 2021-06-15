'use strict';

// import { repetitionTable, TUDU_CARD_CLASSLIST, TUDU_COLLAPSIBLE_CLASSLIST, formatDate, getDate, insertAt, getItemIndex } from './settings.js'
// import  { fillDateInnerHTML, createCollapsibles, createPropertyHTML, fillCollapsibleInnerHTML,
//     createButtonHTML, setOverlaySection, resetOverlay, turnOnModal,
//     turnOffModal, renderModal, checkCompletionDateRead } from './render_functions.js'
// import { formatHourMinutes } from './online_notes.js'

var today = new Date();
// let allTodos = [];
const m = 31;
let allTodos = [];
for (let i = 0; i < m; i++) {
    allTodos[i] = [];
}

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

function isDoneBadge(isDone){
    if (isDone) { return "TuDu"; }
    else { return "DuNe"; }
}

function noteCategory(category){
    switch(category) {
        case "P":
            return "Personal";
        case "W":
            return "Work";
        case "F":
            return "Family";
        default:
            return "Personal";
    }
}

function getRightDate(date) {
    date = date.substring(0, 10);
    return date;
}

const formatHourMinutes = date => {
    var d = new Date(date),
        hours = '' + d.getHours(),
        minutes = '' + d.getMinutes();

    if (hours.length < 2) {
        hours = '0' + hours;
    }

    if (minutes.length < 2) {
        minutes = '0' + minutes;
    }

    return [hours, minutes].join(':');
}

var day = String(today.getDate()).padStart(2, '0');
var month = String(today.getMonth() + 1).padStart(2, '0');
var year = today.getFullYear();
let currentCalendarMonth = "0";


const getTableId = () => {
      
    // Address of the current window
    const address = window.location.search;
  
    // Returns a URLSearchParams object instance
    const parameterList = new URLSearchParams(address);

    let table = 0;

    if (parameterList.has("table_id")) {
        table = parameterList.get("table_id");
    }

    return table;
}

const createNotesLink = table => {
    const notesButton = document.querySelector("#notesButton");
    notesButton.setAttribute('href', `/app?table_id=${table}`);
}

let tableId = getTableId();
createNotesLink(tableId);

const getNotesForDayAndTable = async (date) => {
    let table = tableId;

    try {
        const response = await fetch(`/note?table_id=${table}&date=${date}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const responseJSON = await response.json();
        let notes = await responseJSON["ans"];
        notes = await notes.map(item => {
            item.creation_date_hour = formatHourMinutes(item.creation_date);
            return item;
        })
        return notes;
    } catch (error) {
        // renderModal("Getting notes failed!", error);
        console.log(error);
    }
}

const getTodos = (date) => {
    getNotesForDayAndTable(date).then(notes => {
        allTodos = notes;
        console.log(allTodos);
    });
}


const getMonthlyTodos = (month, year) => {
    let days = daysInMonth(month, year);
    let promises = [];
    let monthlyTodos = [];

    for (let i=1; i<=days; i++){
        let current_day = [year, getDayInMonth(month), getDayInMonth(i)].join('-');
        let prom = getNotesForDayAndTable(current_day).then( any => monthlyTodos.push(any));
        promises.push(prom);
        console.log(prom);
    }

    Promise.allSettled(promises).then( item => {
        console.log(item);
        console.log(monthlyTodos);
    })

    return monthlyTodos;

}

function loadOnlineCalendar() {
    var curDate = $("#demoEvoCalendar").evoCalendar("getActiveDate");
    var dateFormat = curDate.split(" ");
    // var month = getMonthFromString(dateFormat[0]);
    var month = $("#demoEvoCalendar").evoCalendar("getCurrentMonth");
    var year = dateFormat[2];
    var days = daysInMonth(month, year);
    currentCalendarMonth = getDayInMonth(month);
    let count = 0;

    for (let i=1; i<=days; i++){
        let current_day = [year, getDayInMonth(month), getDayInMonth(i)].join('-');

        Promise.all([getNotesForDayAndTable(current_day)]).then( dailyTodos => {
            console.log("The day is: " + current_day);
            count ++;
            document.getElementById("message").innerHTML = "Loading events...";
            // if(month != $("#demoEvoCalendar").evoCalendar("getCurrentMonth")){
            //     i = days;
            // }

            if (dailyTodos[0].length > 0) {
                // console.log(dailyTodos[0]);
                dailyTodos[0].forEach( dailyTodo => {
                    // console.log(dailyTodo);
                    console.log(dailyTodo.creation_date);
                    let current_event = {
                        id: "" + dailyTodo.id + i + month + year,
                        name: dailyTodo.name,
                        description: "Note author: " + dailyTodo.creator,
                        badge: "" + isDoneBadge(dailyTodo.is_done),
                        date: getRightDate(dailyTodo.creation_date),
                        type: noteCategory(dailyTodo.category),
                    }
                    
                    console.log(current_event);
                    var eventExists = $("#demoEvoCalendar").evoCalendar("selectCalendarEvent", current_event);
                    console.log(eventExists);
                    if (!eventExists) {
                        $("#demoEvoCalendar").evoCalendar("addCalendarEvent", current_event);
                    }

                });
            }

            if(count > days-2) { 
                document.getElementById("message").innerHTML = "Welcome!";
                console.log("Załaduj welcome");
            }

        });
    }
}


$(document).ready(function() {
    $('#demoEvoCalendar').evoCalendar({
        format: "MM dd, yyyy",
        titleFormat: "MM"
    });

    loadOnlineCalendar();

    // var curDate = $("#demoEvoCalendar").evoCalendar("getActiveDate");
    // var dateFormat = curDate.split(" ");
    // var month = getMonthFromString(dateFormat[0]);
    // var year = dateFormat[2];
    // var days = daysInMonth(month, year);

    // for (let i=1; i<=days; i++){
    //     let current_day = [year, getDayInMonth(month), getDayInMonth(i)].join('-');
    //     // console.log(current_day);
    //     // dailyTodos = getMonthlySync(current_day);
    //     // console.log(dailyTodos);

    //     Promise.all([getNotesForDayAndTable(current_day)]).then( dailyTodos => {
    //         console.log("The day is: " + current_day);
    //         document.getElementById("message").innerHTML = "Loading events...";
    //         // console.log(dailyTodos);

    //         if (dailyTodos[0].length > 0) {
    //             // console.log(dailyTodos[0]);
    //             dailyTodos[0].forEach( dailyTodo => {
    //                 // console.log(dailyTodo);
    //                 console.log(dailyTodo.creation_date);
    //                 let current_event = {
    //                     id: "" + dailyTodo.id + i + month + year,
    //                     name: dailyTodo.name,
    //                     description: "Autor notatki: " + dailyTodo.creator,
    //                     badge: "" + isDoneBadge(dailyTodo.is_done),
    //                     date: getRightDate(dailyTodo.creation_date),
    //                     type: noteCategory(dailyTodo.category),
    //                 }
                    
    //                 console.log(current_event);
    //                 var eventExists = $("#demoEvoCalendar").evoCalendar("selectCalendarEvent", current_event);
    //                 console.log(eventExists);
    //                 if (!eventExists) {
    //                     $("#demoEvoCalendar").evoCalendar("addCalendarEvent", current_event);
    //                 }

    //             });
    //         }
    //         document.getElementById("message").innerHTML = "Welcome!";

    //     });
    // }
    

    $("#demoEvoCalendar").click( function() {
        console.log("Current month: ");
        console.log(currentCalendarMonth);
        let calMonth = $("#demoEvoCalendar").evoCalendar("getCurrentMonth");
        console.log("Getting new month...");
        console.log(getDayInMonth(calMonth));
        
        if(getDayInMonth(calMonth) != currentCalendarMonth) {
            loadOnlineCalendar();
        }

        // var curDate = $("#demoEvoCalendar").evoCalendar("getActiveDate");
        // var dateFormat = curDate.split(" ");
        // var month = getMonthFromString(dateFormat[0]);
        // var month = $("#demoEvoCalendar").evoCalendar("getCurrentMonth");
        // var year = dateFormat[2];
        // var days = daysInMonth(month, year);
        // let count = 0;

        // for (let i=1; i<=days; i++){
        //     let current_day = [year, getDayInMonth(month), getDayInMonth(i)].join('-');

        //     Promise.all([getNotesForDayAndTable(current_day)]).then( dailyTodos => {
        //         console.log("The day is: " + current_day);
        //         count ++;
        //         document.getElementById("message").innerHTML = "Loading events...";
        //         // if(month != $("#demoEvoCalendar").evoCalendar("getCurrentMonth")){
        //         //     i = days;
        //         // }

        //         if (dailyTodos[0].length > 0) {
        //             // console.log(dailyTodos[0]);
        //             dailyTodos[0].forEach( dailyTodo => {
        //                 // console.log(dailyTodo);
        //                 console.log(dailyTodo.creation_date);
        //                 let current_event = {
        //                     id: "" + dailyTodo.id + i + month + year,
        //                     name: dailyTodo.name,
        //                     description: "Note author: " + dailyTodo.creator,
        //                     badge: "" + isDoneBadge(dailyTodo.is_done),
        //                     date: getRightDate(dailyTodo.creation_date),
        //                     type: noteCategory(dailyTodo.category),
        //                 }
                        
        //                 console.log(current_event);
        //                 var eventExists = $("#demoEvoCalendar").evoCalendar("selectCalendarEvent", current_event);
        //                 console.log(eventExists);
        //                 if (!eventExists) {
        //                     $("#demoEvoCalendar").evoCalendar("addCalendarEvent", current_event);
        //                 }

        //             });
        //         }

        //         if(count > days-2) { 
        //             document.getElementById("message").innerHTML = "Welcome!";
        //             console.log("Załaduj welcome");
        //         }

        //     });
        // }

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

        let url = `/app?date=${fullDate}&table_id=${tableId}`;
        window.location.href = url;
    });


    $("#cancelBtn").click(function() {
        window.history.back();
    });


})
