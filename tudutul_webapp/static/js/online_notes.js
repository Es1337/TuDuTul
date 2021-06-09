/* -------------------------- VARIABLES AND CONSTANTS -------------------------- */
let allTodos = [];

let state = "tuDuDisplay";


const TUDU_CARD_CLASSLIST = ['collapsible', 'p-3', 'inline-block', 'relative', 'cardBackground', 'border-yellow-300', 'border-1', 'rounded-3xl', 'cardWidth', 'w-4/6', 'md:w-3/6', 'xl:w-9/10'];

const TUDU_COLLAPSIBLE_CLASSLIST = ['content', 'w-4/7', 'md:w-3/7', 'xl:w-8/10', 'hidden', 'rounded-b-2xl', 'cardBackground', 'border-yellow-300', 'border-1']

/* -------------------------- INITIAL FUNCTIONS - GET DATE -------------------------- */

// Arrow function to format date to our yyyy-mm-dd format
const formatDate = date => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;

    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

// Arrow function to get all the GET parameters
const getDate = () => {
  
    // Address of the current window
    address = window.location.search;
  
    // Returns a URLSearchParams object instance
    parameterList = new URLSearchParams(address);

    if (parameterList.has("creation_date")) {
        date = parameterList.get("creation_date");
    } else {
        date = formatDate(Date.now());
    }

    return date;
}

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

// Gets the day
const todoDate = getDate();

const fillDateInnerHTML = async date => {
    const dateDisplay = await document.querySelector("#day-display");
    dateDisplay.innerHTML = `The day is: ${date}`;
}

fillDateInnerHTML(todoDate);

/* -------------------------- HTML RENDERING FUNCTIONS -------------------------- */

// Arrow function to create collapsible buttons (in our case, TuDu and DuNe cards)
const createCollapsibles = () => {
    const collapsibles = document.getElementsByClassName("collapsible");
    let i;
    
    for (let i = 0; i < collapsibles.length; i++) {
        collapsibles[i].addEventListener("click", async function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.minHeight){
                content.style.minHeight = null;
            } else {
                content.style.minHeight = content.scrollHeight + "px";
            } 
            });
    }
}

const getNotesForDayAndTable = async (date, table) => {
    let url = new URL("/note"), 
        params = {date:date, table:table};

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

    const response = await fetch(url);
    const notesJSON = await response.json();
    return notesJSON;
}

// Arrow function to create button's (in our case, TuDu card's) innerHTML
// IMPORTANT: The button itself has different CSS styling, specified in TUDU_CARD_CLASSLIST constant
const fillButtonInnerHTML = item => {
    const checked = item.is_done == true ? 'checked' : null;
    const priorityHTML = createPropertyHTML(item.priority);
    return `<div class="px-4 mx-auto mb-1 flex justify-between items-center">
                <p class="font-black text-white tracking-wide text-xl">${item.name}</p>
                <input type="checkbox" ${checked} disabled>
            </div>
            <p class="mx-4 font-bold text-left text-yellow-300">${item.completion_date}</p>
            <div class="mx-auto px-4 flex items-center justify-between">
                <p class="flex font-bold  text-sm text-yellow-300">${item.category}</p>
                <div>` +
                    priorityHTML + 
                `</div>
            </div>`;
}

// Arrow function to create HTML associated with priority of a card
const createPropertyHTML = priority => {
    priority = parseInt(priority, 10);
    switch(priority) {
        case 1:
            return `<i class=" my-1 fas fa-exclamation text-yellow-200"></i>`;
            break;
        case 2:
            return `<i class=" my-1 fas fa-exclamation text-yellow-300"></i>
                    <i class=" my-1 fas fa-exclamation text-yellow-300"></i>`;
        case 3:
            return `<i class=" my-1 fas fa-exclamation text-red-500"></i>
                    <i class=" my-1 fas fa-exclamation text-red-500"></i>
                    <i class=" my-1 fas fa-exclamation text-red-500"></i>`;
        default:
            console.error("WRONG VALUE OF PRIORITY");
            break;
    }
}

// Function to create innerHTML of the collapsible button's content
// IMPORTANT: The button itself has different CSS styling, specified in TUDU_CARD_CLASSLIST constant
const fillCollapsibleInnerHTML = item => {
    return `<div class="bg-white p-2 mx-3 mb-3 block max-w-full font-medium specialtext  rounded-b-xl">${item.content}</div>
            <div class="px-3 pb-3 flex justify-end items-center">
                <i class="editIcon my-1 px-2 fas fa-edit text-md sm:text-lg text-white cursor-pointer" onClick="getFormModule(${item.id});"></i>
                <i class="deleteIcon my-1 fas fa-trash-alt text-md sm:text-lg text-white cursor-pointer" onClick="deleteTuDu(${item.id});"></i>
            </div>`;
}

// Functino that creates the collapsible HTML and adds according classes to it
// It consists of a div, inside the div we have the area that displays the item's content + the edit and delete buttons
const createCollapsibleHTML = item => {
    const collapsible = document.createElement('div');
    collapsible.classList.add(...TUDU_COLLAPSIBLE_CLASSLIST);
    collapsible.innerHTML = fillCollapsibleInnerHTML(item);
    return collapsible;
}

// TODO: Change the code up there to template maybe -> possibility for one file with HTML for buttons / cards
const createButtonHTML = item => {
    const button = document.createElement('button');
    button.classList.add(...TUDU_CARD_CLASSLIST);
    button.innerHTML = fillButtonInnerHTML(item);
    return button;
}

// Arrow function to render Todos based on the allTodos list
const renderTodos = (todos) => {
    const tuDuContainer = document.querySelector("#tuDuContainer");
    const duNeContainer = document.querySelector("#duNeContainer");

    tuDuContainer.innerHTML = '';
    duNeContainer.innerHTML = '';
  
    todos.forEach(item => {
      const buttonToAdd = createButtonHTML(item);
      const collapsibleToAdd = createCollapsibleHTML(item);
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

