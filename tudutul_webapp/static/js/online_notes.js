import { repetitionTable, TUDU_CARD_CLASSLIST, TUDU_COLLAPSIBLE_CLASSLIST, formatDate, getDate } from './settings.js'
import  { fillDateInnerHTML, createCollapsibles, fillButtonInnerHTML, createPropertyHTML, fillCollapsibleInnerHTML,
    createButtonHTML, setOverlaySection, resetOverlay, turnOnModal,
    turnOffModal, renderModal } from './render_functions.js'
// IMPORTANT: ALLTODOS ARRAY IS LOADED AROUND LINE 290

/* -------------------------- INITIAL FUNCTIONS - GET DATE -------------------------- */

// ASK: CAN BE CREATE DEFAULT TABLE ON LOG IN
const getTableId = () => {
      
    // Address of the current window
    address = window.location.search;
  
    // Returns a URLSearchParams object instance
    parameterList = new URLSearchParams(address);

    if (parameterList.has("table_id")) {
        table = parameterList.get("table_id");
    } else {
        table = -1;
    }

    return table;
}


/* -------------------------- HTML RENDERING FUNCTIONS -------------------------- */

const getNotesForDayAndTable = async (date, table) => {
    let url = new URL("/note"), 
        params = {date:date, table_id:table};

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url);
    const notesJSON = await response.json();
    return notesJSON;
}

/* -------------------------- VARIABLES AND CONSTANTS -------------------------- */
let allTodos = [];

let state = "tuDuDisplay";

let tableId = getTableId();

// Gets the day
const todoDate = getDate();
console.log("THIS PAGE'S DATE:", todoDate);

fillDateInnerHTML(todoDate);


// addTuDu, editTuDu, deleteTuDu

// renderDeleteModal

// renderToDos

// createCollapsibleHTML

// getTuDuDisplayModule

// getFormModule


// get allTodos, then renderTodos

allTodos = getNotesForDayAndTable(todoDate, tableId);
renderTodos(allTodos);

const displayButton = document.querySelector("#displayButton");
console.log(displayButton);
displayButton.addEventListener("onclick", getTuDuDisplayModule);

const addButton = document.querySelector("#addButton");
console.log(addButton);
addButton.addEventListener("onclick", getFormModule);

