'use strict';

import { repetitionTable, TUDU_CARD_CLASSLIST, TUDU_COLLAPSIBLE_CLASSLIST, formatDate, getDate, insertAt, getItemIndex } from './settings.js'
import  { fillDateInnerHTML, createCollapsibles, createPropertyHTML, fillCollapsibleInnerHTML,
    createButtonHTML, setOverlaySection, resetOverlay, turnOnModal,
    turnOffModal, renderModal, checkCompletionDateRead } from './render_functions.js'
// IMPORTANT: ALLTODOS ARRAY IS LOADED AROUND LINE 290



/* -------------------------- INITIAL FUNCTIONS - GET DATE -------------------------- */

// ASK: CAN BE CREATE DEFAULT TABLE ON LOG IN
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

const createCalendarLink = table => {
    const calendarButton = document.querySelector("#calendarButton");
    calendarButton.setAttribute('href', `/app/calendar?table_id=${table}`);
}


/* -------------------------- HTML RENDERING FUNCTIONS -------------------------- */

const getNotesForDayAndTable = async (date, table) => {
    // let url = new URL("./note"), 
    //     params = {date:date, table_id:table};

    // Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    // const response = await fetch(url);
    // const notesJSON = await response.json();
    // return notesJSON;

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
        });
        return notes;
    } catch (error) {
        renderModal("Getting notes failed!", error);
    }
}

// Functino that creates the collapsible HTML and adds according classes to it
// It consists of a div, inside the div we have the area that displays the item's content + the edit and delete buttons
const createCollapsibleHTML = (item, todos) => {
    const collapsible = document.createElement('div');
    collapsible.classList.add(...TUDU_COLLAPSIBLE_CLASSLIST);
    collapsible.innerHTML = fillCollapsibleInnerHTML(item);
    
    const editTuDuButton = collapsible.getElementsByClassName("editIcon")[0];
    const deleteTuDuButton = collapsible.getElementsByClassName("deleteIcon")[0];

    editTuDuButton.addEventListener("click", () => {
        getFormModule(item.id, todos);
    })
    deleteTuDuButton.addEventListener("click", () => {
        renderOnlineDeleteModal(item.id);
    })

    return collapsible;
}


// Arrow function to render Todos based on the allTodos list
const renderTodos = (todos) => {
    if (state === "addForm" || state === "editForm") return;

    const tuDuContainer = document.querySelector("#tuDuContainer");
    const duNeContainer = document.querySelector("#duNeContainer");

    tuDuContainer.innerHTML = '';
    duNeContainer.innerHTML = '';
  
    todos.forEach(item => {
      const buttonToAdd = createButtonHTML(item);
      const collapsibleToAdd = createCollapsibleHTML(item, todos);
      if (item.is_done == true) {
        duNeContainer.appendChild(buttonToAdd);
        duNeContainer.appendChild(collapsibleToAdd);
      } else {
        tuDuContainer.appendChild(buttonToAdd);
        tuDuContainer.appendChild(collapsibleToAdd);
      }
    });

    createCollapsibles();
}

/* -------------------------- VARIABLES AND CONSTANTS -------------------------- */
let allTodos = [];

let state = "tuDuDisplay";

let tableId = getTableId();
createCalendarLink(tableId);
// Gets the day
const todoDate = getDate();
console.log("THIS PAGE'S DATE:", todoDate);

fillDateInnerHTML(todoDate);

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

const addTuDu = async formHTML => {
    const form = new FormData(formHTML);

    let itemToAdd = {};
    form.forEach((value, key) => itemToAdd[key] = value);
    itemToAdd.creation_date = [formatDate(todoDate), itemToAdd.creation_date_hour].join(' ');
    itemToAdd.owning_table_id = tableId;
    if (form.get('is_done') === null) {
        itemToAdd.is_done = false;
    } else {
        itemToAdd.is_done = true;
    }
    if (itemToAdd.repetition === "N") {
        itemToAdd.completion_date = "2137-12-12";
    }
    itemToAdd.priority = parseInt(itemToAdd.priority, 10);
    delete itemToAdd.creation_date_hour;

    try {
        const response = await fetch(`/note/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemToAdd)
        });
        console.log(response);
        const responseJSON = await response.json();
        let modalHeader = "Operation successful!";

        if (!response.ok) {
            modalHeader = "Operation failed!";
        }
        renderModal(modalHeader, responseJSON["ans"]);

    } catch (error) {
        renderModal("Operation failed - client side error!", error);
    }

    updateTodos();
}

const editTuDu = async (formHTML, id) => {
    const form = new FormData(formHTML);

    console.log(id);

    const itemToEdit = allTodos.filter(item => item.id === id)[0];
    form.forEach((value, key) => itemToEdit[key] = value);
    itemToEdit.creation_date = [formatDate(todoDate), itemToEdit.creation_date_hour].join(' ');
    itemToEdit.owning_table_id = tableId;
    if (form.get('is_done') === null) {
        itemToEdit.is_done = false;
    } else {
        itemToEdit.is_done = true;
    }
    if (itemToEdit.repetition === "N") {
        itemToEdit.completion_date = "2137-12-12";
    }
    itemToEdit.priority = parseInt(itemToEdit.priority, 10);
    delete itemToEdit.creation_date_hour;

    console.log(itemToEdit);
    try {
        const response = await fetch(`/note/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemToEdit)
        });
        console.log(response);
        const responseJSON = await response.json();
        let modalHeader = "Operation succesfful!";

        if (!response.ok) {
            modalHeader = "Operation failed!";
        }
        renderModal(modalHeader, responseJSON["ans"]);

    } catch (error) {
        renderModal("Operation failed - client side error!", error);
    }

    updateTodos();

    
}

const deleteTuDu = async (id) => {
    console.log(id);
    try {
        const response = await fetch(`/note/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log(response);
        const responseJSON = await response.json();
        let modalHeader = "Operation successful!";

        if (!response.ok) {
            modalHeader = "Operation failed!";
        }
        renderModal(modalHeader, responseJSON["ans"]);

    } catch (error) {
        renderModal("Operation failed - client side error!", error);
    }

    updateTodos();
}
// renderDeleteModal

// Arrow function that allows us to render TuDu displaying
const getTuDuDisplayModule = () => {
    if (state == "tuDuDisplay") return;

    const mainDisplay = document.querySelector("#feature-display");
    mainDisplay.innerHTML = `
    <div class="mt-10 w-full flex flex-col items-center h-full">
        <p class="w-full text-center specialtext font-black text-4xl mb-5"><mark class="redMain">Tu</mark><mark class="blueMain">Du</mark></p>
        <div id="tuDuContainer" class="flex flex-col gap-4 items-center overflow-auto cardBoxWidth w-9/10 lg:w-4/6 h-5/6 toDoScroller">

            

            
            
            
        </div>
    </div>

    <div class="mb-32 xl:mb-0 mt-10 w-full flex flex-col items-center lg:h-full">
        <p class="w-full text-center specialtext font-black text-4xl mb-5"><mark class="blueMain">Du</mark><mark class="redMain">Ne</mark></p>
        <div id="duNeContainer" class="min-h-16 flex flex-col gap-4 items-center overflow-auto cardBoxWidth w-9/10 lg:w-4/6 h-5/6 toDoScroller">

                
            
            
        </div>
    </div>`;

    state = "tuDuDisplay";
    renderTodos(allTodos);

}

// Arrow function to render a FormModule -> works for both editing and adding TuDus
// We pass id of item into it, then it works as editing form
// Otherwise it allows us to add (hence the changed method string)
const getFormModule = (id, todos) => {
    let item;
    let index;
    if (id !== undefined) {
        index = getItemIndex(id, todos);
        item = todos[index];
    }

    if (state == "addForm" && item === undefined) return;

    if (item === undefined) {
        state = "addForm";
    } else {
        state = "editForm";
    }

    let name = null;
    let creation_date_hour = null;
    let completion_date = null;
    let completion_date_disabled = null;
    let priority = `value=1`;
    let is_done = null;
    let content = ``;
    let repetition = `N`;
    let category = null;
    let method = `addTuDu`;

    if (item !== undefined) {
        name = `value="` + item.name + `"`;
        creation_date_hour = `value="` + item.creation_date_hour + `"`;
        completion_date = `value="` + formatDate(item.completion_date) + `"`;
        priority = `value="` + item.priority + `"`;
        is_done = item.is_done === true ? 'checked' : null;
        content = item.content;
        repetition = item.repetition;
        category = item.category;
        method = `editTuDu`;
    }

    completion_date_disabled = repetition === `N` || item.repetition === 'N' ? 'disabled="true"' : null;

    // CONVERT THIS UGLY ASS INNER HTML TO CHANGING THE DOM
    const mainDisplay = document.querySelector("#feature-display");
    mainDisplay.innerHTML = `
    <div class="mt-10 mb-20 lg:mb-0 w-full flex flex-col items-center h-full">
        <form class="flex flex-col lg:flex-row gap-7 h-full w-full" id="add-note-form">
            <div class="h-full w-full flex flex-col items-center gap-3">
                <div class="gap-3 flex flex-col w-1/5">
                    <label class="special-text tracking-wider text-indigo-100 text-lg font-bold  " >Name:</label>
                    <input type="text" name="name" id="name" ` + name + ` class="border-b-2 border-yellow-300  p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md">
                </div>
                
                <div class="gap-3 flex flex-col w-1/5">
                    <label class="special-text tracking-wider text-indigo-100 text-lg font-bold " >Completion date:</label>
                    <input type="time" name="creation_date_hour" id="creation_date_hour" ` + creation_date_hour + ` class="border-b-2 border-yellow-300 p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md">
                </div>

                <div class="gap-3 flex flex-col w-1/5">
                    <label class="special-text tracking-wider text-indigo-100 text-lg font-bold " >Priority:</label>
                    <input type="number" min=1 max=3 name="priority" id="priority" ` + priority + ` class="border-b-2 border-yellow-300 p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md">
                </div>

                <div class="gap-3 flex flex-col w-1/5">
                    <label class="special-text tracking-wider text-indigo-100 text-lg font-bold " >DuNe:</label>
                    <input type="checkbox" name="is_done" id="is_done" ` + is_done + ` class="border-b-2 border-yellow-300 p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md">
                </div>
            </div>
            
            <div class="w-full h-full flex flex-col items-center gap-3">
                <div class="gap-3 flex flex-col w-1/5">
                    <label class="special-text tracking-wider text-indigo-100 text-lg font-bold " >Content:</label>
                    <textarea name="content" id="content" class="border-b-2 border-yellow-300 p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md">${content}</textarea>
                </div>
        
        
                <div class="gap-3 flex flex-col w-1/5">
                <label class="special-text tracking-wider text-indigo-100 text-lg font-bold " >Repetition:</label>
                    <select name="repetition" id="repetition" ` + '' + 
                    ` class="border-b-2 border-yellow-300 p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md"
                    >
                        <option value="N" ${repetition == "N" ? 'selected' : ''}>No repetition</option>
                        <option value="D" ${repetition == "D" ? 'selected' : ''}>Daily</option>
                        <option value="W" ${repetition == "W" ? 'selected' : ''}>Weekly</option>
                        <option value="M" ${repetition == "M" ? 'selected' : ''}>Monthly</option>
                        <option value="Y" ${repetition == "Y" ? 'selected' : ''}>Yearly</option>
                    </select>
                </div>

                <div class="gap-3 flex flex-col w-1/5">
                <label class="special-text tracking-wider text-indigo-100 text-lg font-bold " >Last repeat date:</label>
                    <input type="date" name="completion_date" ` + completion_date_disabled + ` id="completion_date" ` + completion_date + ` class="border-b-2 border-yellow-300 p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md">
                </div>
        
                <div class="gap-3 flex flex-col w-1/5">
                    <label class="special-text tracking-wider text-indigo-100 text-lg font-bold " >Category:</label>
                    <select name="category" id="category" ` + '' + ` class="border-b-2 border-yellow-300 p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md">
                        <option value="P" ${category == "Personal" ? 'selected' : ''}>Personal</option>
                        <option value="W" ${category == "Work" ? 'selected' : ''}>Work</option>
                        <option value="F" ${category == "Family" ? 'selected' : ''}>Family</option>
                    </select>
                </div>
        
                <input
                    type="button" id="formButton"
                    class="max-w-md inline-block py-2 px-4 shadow-xl text-background font-black bg-yellow-400 hover:bg-yellow-300 hover:text-white rounded transition ease-in duration-400"
                    value="${ state === "addForm" ? 'Add' : 'Edit' }"
                     ` + '' + ` 
                >
                
            </div>

        </form>
    </div>
    `;

    const formButton = document.querySelector("#formButton");
    if (method === "addTuDu") {
        formButton.addEventListener("click", () => {
            addTuDu(document.getElementById('add-note-form'));
        })
    } else if (method === "editTuDu") {
        formButton.addEventListener("click", () => {
            editTuDu(document.getElementById('add-note-form'), id);
        })
    }

    const repetitionBox = document.querySelector("#repetition");
    repetitionBox.addEventListener("change", () => {
        checkCompletionDateRead();
    })

}

const renderOnlineDeleteModal = (id) => {
    let headerHTML = `Delete TuDu`;
    let textHTML = `Do you want to delete the TuDu?`;

    renderModal(headerHTML, textHTML, 'Delete');

    const functionButton = document.querySelector("#functionButton");
    functionButton.addEventListener("click", () => {
        deleteTuDu(id);
    })
}

// get allTodos, then renderTodos

const updateTodos = () => {
    getNotesForDayAndTable(todoDate, tableId).then(notes => {
        allTodos = notes;
        console.log(allTodos);
        renderTodos(allTodos);
        getTuDuDisplayModule();
    });
}

updateTodos();


const displayButton = document.querySelector("#displayButton");
console.log(displayButton);
displayButton.addEventListener("click", () => {
    getTuDuDisplayModule();
});

const addButton = document.querySelector("#addButton");
console.log(addButton);
addButton.addEventListener("click", () => {
    getFormModule();
});

console.log(formatHourMinutes("2021-07-07T16:00:00"));

