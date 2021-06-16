import { repetitionTable, TUDU_CARD_CLASSLIST, TUDU_COLLAPSIBLE_CLASSLIST, formatDate, getDate, insertAt, getItemIndex } from './settings.js'
import  { fillDateInnerHTML, createCollapsibles, fillButtonInnerHTML, createPropertyHTML, fillCollapsibleInnerHTML,
    createButtonHTML, setOverlaySection, resetOverlay, turnOnModal,
    turnOffModal, renderModal, checkCompletionDateRead } from './render_functions.js'
// IMPORTANT: ALLTODOS ARRAY IS LOADED AROUND LINE 290

/* -------------------------- VARIABLES AND CONSTANTS -------------------------- */
let allTodos = [];

let state = "tuDuDisplay";

/* -------------------------- INITIAL FUNCTIONS - GET DATE -------------------------- */

const checkIfIdSet = () => {
    if (localStorage.getItem('id') === null) {
        localStorage.setItem('id', 1);
    }
}
checkIfIdSet();


// Gets the day
const todoDate = getDate();
console.log("THIS PAGE'S DATE:", todoDate);

fillDateInnerHTML(todoDate);

// Arrow function to download todos for a set day
// TODO: Convert function to read from a certain day
const getFromLocalStorage = date => {
    
    const reference = localStorage.getItem(date);
    let toDoList = [];

    if (reference) {
        // convert back from JSON into array
        try {
            toDoList = JSON.parse(reference);
        } catch(error) {
            console.log(error);
        }
    }

    console.log("GETTING LOCAL STORAGE DATE:", date);
    console.log("GETTING FROM LOCAL STORAGE", toDoList);
    return toDoList;
}

/* -------------------------- HTML RENDERING FUNCTIONS -------------------------- */

// IMPORT createCollapsibles!!! and fillButtonInnerHTML

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
        renderOfflineDeleteModal(item.id);
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

  /* -------------------------- TUDU HANDLING FUNCTIONS -------------------------- */

// Function that increments the current id of note and allows us to get incremental id's
// Saved in the localStorage under the 'id' field
const getId = () => {
    const reference = localStorage.getItem('id');
    let currentId;
    if (reference) {
        currentId = parseInt(reference, 10);
    }
    localStorage.setItem('id', JSON.stringify(currentId + 1));
    return currentId;
}

  
// Arrow function to save todos array (in our code in form of allTodos) to local storage
const saveToLocalStorage = (todos, date) => {
    console.log("SAVE TO LOCAL STORAGE TODOS:", todos);
    console.log("SAVE TO LOCAL STORAGE DATE:", date);
    localStorage.setItem(date, JSON.stringify(todos));
}

// Arrow function to save ToDo from a form object
const addTuDu = formHTML => {
    const form = new FormData(formHTML);
  
    let itemToAdd = {};
    form.forEach((value, key) => itemToAdd[key] = value);
    
    itemToAdd.id = getId();
    itemToAdd.creator = "You";
    itemToAdd.creation_date = formatDate(todoDate);
    itemToAdd.owning_table_id = -1;
    if (form.get('is_done') === null) {
        itemToAdd.is_done = false;
    } else {
        itemToAdd.is_done = true;
    }
    if (itemToAdd.repetition === "N") {
        itemToAdd.completion_date = "2137-12-12";
    }
    if (itemToAdd.repetition !== "N") {
        addRepeatingTudus(itemToAdd);
        allTodos = getFromLocalStorage(todoDate);
        getTuDuDisplayModule();
        return;
    }

    allTodos.push(itemToAdd);
    sortTudusByHour(allTodos);

    saveToLocalStorage(allTodos, todoDate);
    allTodos = getFromLocalStorage(todoDate);
    
    getTuDuDisplayModule();
}

const incrementDate = (date, increment) => {
    let year = date.getFullYear(),
        month = date.getMonth(),
        day = date.getDate();

    switch(increment) {
        case 'Y':
            year++;
            break;
        case 'W':
            day += 7;
            break;
        case 'M':
            month++;
            break;
        case 'D':
            day++;
            break;
        default:
            break;
    }

    return new Date(year, month, day);
}

const addRepeatingTudus = (item) => {
    let currentDate = new Date(item.creation_date);
    let endDate = new Date(item.completion_date);

    endDate = incrementDate(endDate, "D");

    let repetition = item.repetition;

    console.log("ADD INITIAL CURRENT DATE:", currentDate);
    console.log("ADD END DATE:", endDate);

    let tempTodo = [];

    while (currentDate < endDate) {
        console.log("ADD CURRENT DATE:", currentDate);
        
        tempTodo = getFromLocalStorage(formatDate(currentDate));
        tempTodo.push(item);
        sortTudusByHour(tempTodo);

        saveToLocalStorage(tempTodo, formatDate(currentDate));
        currentDate = incrementDate(currentDate, repetition);
    }
}

const deleteRepeatingTudus = item => {
    let currentDate = new Date(item.creation_date);
    let endDate = new Date(item.completion_date);

    endDate = incrementDate(endDate, "D");

    console.log("DELETE INITIAL CURRENT DATE:", currentDate);
    console.log("DELETE END DATE:", endDate);
    
    let tempTodo = [];
    while (currentDate < endDate) {
        console.log("DELETE CURRENT DATE:", currentDate);

        tempTodo = getFromLocalStorage(formatDate(currentDate));
        deleteTuDu(item.id, tempTodo, formatDate(currentDate), false);
        currentDate = incrementDate(currentDate, item.repetition);
    }
}

const sortTudusByHour = todos => {
    todos.sort((a, b) => (new Date('1/1/1999 ' + a.creation_date_hour) > new Date('1/1/1999 ' + b.creation_date_hour)) ? 1 : -1);
}

// Function that deletes a tudu with given id of tudu
const deleteTuDu = (id, todos, date, checkRepetition) => {
    let index;
    const length = todos.length;

    index = getItemIndex(id, todos);
    
    if (index === null) return;
    
    console.log("DELETE TUDU DATE:", date);
    console.log("DELETE TUDU ITEM:", todos[index]);

    if (checkRepetition && todos[index].repetition !== "N") {
        deleteRepeatingTudus(todos[index]);
        return;
    }

    if (index !== null) {
        todos.splice(index, 1);
    } else {
        renderModal("Delete failed!", "There seems to be a problem with your browser's local storage. Try again.");
    }

    console.log("SINGLE ITEM DELETIONS");

    turnOffModal();
    allTodos = getFromLocalStorage(todoDate);
    renderTodos(allTodos);
}

const editTuDu = (formHTML, id) => {
    const form = new FormData(formHTML);

    const index = getItemIndex(id, allTodos);

    if (index === null) return;

    const newTuDu = {...allTodos[index]};

    console.log("EDIT TUDU REPETITION:", allTodos[index].repetition);

    if (allTodos[index].repetition !== "N") {
        console.log("DELETING EDITED TUDU");
        deleteTuDu(id, allTodos, todoDate, true);
    } else {
        deleteTuDu(id, allTodos, todoDate, false);
    }
    
    form.forEach((value, key) => newTuDu[key] = value);

    if (form.get('is_done') === null) {
        newTuDu['is_done'] = false;
    } else {
        newTuDu['is_done'] = true;
    }

    console.log("NEW TUDU");
    if (newTuDu.repetition !== "N") {
        addRepeatingTudus(newTuDu);
    } else {
        allTodos.push(newTuDu);
        sortTudusByHour(allTodos);
        saveToLocalStorage(allTodos, todoDate);
    }

    // saveToLocalStorage(allTodos, todoDate);
    allTodos = getFromLocalStorage(todoDate);
    getTuDuDisplayModule();
}

// EXAMPLE OF INSERTAT USAGE
// let num = [1,2,3,6,7,8];
// let insert = [4,5];
// insertAt(num, 2, ...insert); // [1,2,4,5,3,6,7,8]
// console.log(num);

 /* -------------------------- TUDU LOADING -------------------------- */

 allTodos = getFromLocalStorage(todoDate);
 renderTodos(allTodos);
 
 console.log("INITAL TODO:", allTodos);

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

const renderOfflineDeleteModal = id => {
    let headerHTML = `Delete TuDu`;
    let textHTML = `Do you want to delete the TuDu?`;

    renderModal(headerHTML, textHTML, 'Delete');

    const functionButton = document.querySelector("#functionButton");
    functionButton.addEventListener("click", () => {
        deleteTuDu(id, allTodos, todoDate, true);
    })
}



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
        completion_date = `value="` + item.completion_date + `"`;
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
                        <option value="Personal" ${category == "Personal" ? 'selected' : ''}>Personal</option>
                        <option value="Work" ${category == "Work" ? 'selected' : ''}>Work</option>
                        <option value="Family" ${category == "Family" ? 'selected' : ''}>Family</option>
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
