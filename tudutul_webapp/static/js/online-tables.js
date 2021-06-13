/* -------------------------- VARIABLES AND CONSTANTS -------------------------- */
let tables = [];

let state = "tableDisplay";


const TUDU_CARD_CLASSLIST = ['collapsible', 'p-3', 'inline-block', 'relative', 'cardBackground', 'border-yellow-300', 'border-1', 'rounded-3xl', 'cardWidth', 'w-4/6', 'md:w-3/6', 'xl:w-9/10'];

const TUDU_COLLAPSIBLE_CLASSLIST = ['content', 'w-4/7', 'md:w-3/7', 'xl:w-8/10', 'hidden', 'rounded-b-2xl', 'cardBackground', 'border-yellow-300', 'border-1'];

const redirectToMain = (id) => {
    window.location.href = "/app?table_id=" + id;
}

const getFromAPI = async () => {
    const response = await fetch("/table", {
        method: 'GET'
    });

    const tablesJSON = await response.json();
    console.log("GETTING FROM API");

    return tablesJSON;
}

const sendToAPI = async (name, is_shared, shared_with) => {
    var object = {};

    object['name'] = name;
    object['is_shared'] = is_shared;
    object['shared_with'] = shared_with;

    try{
        const response = await fetch("/table/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(object)
        });
    
        const tablesJSON = await response.json();
        console.log("SENDING TO API");
    
        return tablesJSON;
    }
    catch(error) {
        console.log('error');
    }

    return {ans: ""};
}

const checkIfIdSet = () => {
    const tablesJSON = getFromAPI().then(function(result) { 
        console.log(result.ans)
    });
    // tablesJSON.forEach(item => console.log(item));
    // console.log(tablesJSON);
    if (localStorage.getItem('table-id') === null) {
        localStorage.setItem('table-id', 1);
    }
}
// checkIfIdSet();

/* -------------------------- HTML RENDERING FUNCTIONS -------------------------- */

// Arrow function to create collapsible buttons (in our case, TuDu and DuNe cards)
const createCollapsibles = () => {
    const collapsibles = document.getElementsByClassName("collapsible");
    
    for (let item of collapsibles) {
        item.addEventListener("click", async function() {
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

// Arrow function to create button's (in our case, TuDu card's) innerHTML
// IMPORTANT: The button itself has different CSS styling, specified in TUDU_CARD_CLASSLIST constant
const fillButtonInnerHTML = item => {
    let category = item.is_shared ? "Shared" : "Private";
    return `<div class="px-4 mx-auto mb-1 flex justify-between items-center">
                <p class="font-black text-white tracking-wide text-xl">${item.name}</p>
            </div>
            <div class="mx-auto px-4 flex items-center justify-between">
                <p class="flex font-bold  text-sm text-yellow-300">${category}</p>
            </div>`;
}

// Function to create innerHTML of the collapsible button's content
// IMPORTANT: The button itself has different CSS styling, specified in TUDU_CARD_CLASSLIST constant
const fillCollapsibleInnerHTML = item => {
    let users = item.owner;
    item.shared_with.forEach(user => users += '<br>' + user);
    return `<br/>
            <br/>
            <div class="bg-white p-2 mx-3 mb-3 block max-w-full font-medium specialtext  rounded-b-xl">${users}</div>
            <div class="px-3 pb-3 flex justify-end items-center">
                <i class="editIcon my-1 px-2 fas fa-edit text-md sm:text-lg text-white cursor-pointer" onClick="getFormModule(${item.id});"></i>
                <i class="deleteIcon my-1 px-2 fas fa-trash-alt text-md sm:text-lg text-white cursor-pointer" onClick="deleteTable(${item.id});"></i>
                <i class="openIcon my-1 px-2 fas fa-arrow-alt-circle-right text-md sm:text-lg text-white cursor-pointer" onclick="redirectToMain(${item.id});"></i>
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

// Arrow function to render Tables based on the tables list
const renderTables = (tables) => {
    
    const tablesContainer = document.querySelector("#tablesContainer");

    tablesContainer.innerHTML = '';
  
    tables.forEach(item => {
        const buttonToAdd = createButtonHTML(item);
        const collapsibleToAdd = createCollapsibleHTML(item);

        tablesContainer.appendChild(buttonToAdd);
        tablesContainer.appendChild(collapsibleToAdd);
    });

    createCollapsibles();
  }

  /* -------------------------- TUDU HANDLING FUNCTIONS -------------------------- */

// Arrow function allowing us to insert item in array on specific index 
const insertAt = (array, index, ...items) => {
    array.splice(index, 0, ...items);
}

// Function that increments the current id of note and allows us to get incremental id's
// Saved in the localStorage under the 'id' field
const getId = () => {
    const reference = localStorage.getItem('table-id');
    let currentId;
    if (reference) {
        currentId = parseInt(reference, 10);
    }
    localStorage.setItem('table-id', JSON.stringify(currentId + 1));

    return currentId;
}


// Arrow function to download todos for a set day
// TODO: Convert function to read from a certain day
const getFromLocalStorage = () => {
    const reference = localStorage.getItem('tables');
  
    if (reference) {
        // convert back from JSON into array
        tableList = JSON.parse(reference);
    } else {
        tableList = [];
    }
    console.log("GETTING FROM LOCAL STORAGE");
    return tableList;
}
  
// Arrow function to save todos array (in our code in form of todos) to local storage
const saveToLocalStorage = tables => {
    localStorage.setItem('tables', JSON.stringify(tables));
}

// Function that returns a TuDu's index in the 'tables' array
const getItemIndex = id => {
    const length = tables.length;

    for (let i = 0; i < length; i++) {
        if (tables[i].id == id) {
            return i;
        }
    }

    return null;
}

// Arrow function to save ToDo from a form object
const addTable = async formHTML => {
    const form = new FormData(formHTML);

    let itemToAdd = {};
    form.forEach((value, key) => itemToAdd[key] = value);

    itemToAdd.id = getId();
    itemToAdd.creator = "You";
    itemToAdd.users_added = formHTML.querySelector("#users-added").value;

    var is_shared = itemToAdd.category === "Private" ? true : false;
    var shared_with = itemToAdd.users_added.split("<br>");

    sendToAPI(itemToAdd.name, is_shared, shared_with);
    getFromAPI().then(data => tables = data);
    state = "";
    getTableDisplayModule();
}

// Function that deletes a tudu with given id of tudu
const deleteTable = async id => {
    let index;
    index = getItemIndex(id);

    let url = "/table/" + id;
    const response = await fetch(url, {
        method: 'DELETE'
    });

    const deleteJSON = await response.json();
    console.log(await deleteJSON.ans);

    getFromAPI().then(data => tables = data);
    state = "";
    getTableDisplayModule();
}

// IMPORTANT: THIS METHOD TAKES THE INDEX OF THE TUDU IN THE ARRAY, NOT THE ID OF IT!
const editTable = async (formHTML, id) => {
    const form = new FormData(formHTML);

    const is_shared = form.get('category') === "Shared" ? true : false;
    const name = form.get('name');
    const shared_with = formHTML.querySelector("#users-added").value.split("<br>");

    var object = {};
    object['name'] = name;
    object['is_shared'] = is_shared;
    object['shared_with'] = shared_with;

    let url = "/table/" + id;
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(object)
    });

    const editJSON = await response.json();
    console.log(await editJSON.ans);
    state = "";
    getTableDisplayModule();
}

// EXAMPLE OF INSERTAT USAGE
// let num = [1,2,3,6,7,8];
// let insert = [4,5];
// insertAt(num, 2, ...insert); // [1,2,4,5,3,6,7,8]
// console.log(num);

 /* -------------------------- TUDU LOADING -------------------------- */

tables = getFromAPI().then(function(result) { 
    renderTables(result.ans);
});


 /* -------------------------- MODULE RENDERING FUNCTIONS -------------------------- */

// Arrow function that allows us to render TuDu displaying
const getTableDisplayModule = async () => {
    if (state == "tableDisplay") return;

    const mainDisplay = document.querySelector("#feature-display");
    mainDisplay.innerHTML = `
    <div class="mt-10 w-full flex flex-col items-center h-full">
        <p class="w-full text-center specialtext font-black text-4xl mb-5"><mark class="redMain">Tab</mark><mark class="blueMain">Les</mark></p>
        <div id="tablesContainer" class="flex flex-col gap-4 items-center overflow-auto cardBoxWidth w-9/10 lg:w-4/6 h-5/6 toDoScroller">

            

            
            
            
        </div>
    </div>
    `

    tables = getFromAPI().then(function(result) { 
        renderTables(result.ans);
    });
    state = "tableDisplay";
}

const addUser = async () => {
    let userEmail = document.getElementById('user-email').value;

    document.getElementById('users-field').innerHTML += userEmail + '<br>';
    document.getElementById('users-added').value += userEmail + '<br>';
}

// Arrow function to render a FormModule -> works for both editing and adding TuDus
// We pass id of item into it, then it works as editing form
// Otherwise it allows us to add (hence the changed method string)
const getFormModule = async id => {
    let item;

    if (id !== undefined) {
        let url = "/table/" + id;
        const res = await fetch(url, {
            method: 'GET'
        });
        item = await res.json();
    }

    if (state == "addForm" && item === undefined) return;

    let name = null;
    let users_added = '';
    let category = null;
    let method = `onclick="addTable(document.getElementById('add-table-form'));"`;

    if (item !== undefined) {
        var is_shared = item.ans.category ===  true ? "Shared" : "Private";
        var shared_with = "";
        item.ans.shared_with.forEach(user => shared_with += user + "<br>");
        name = `value="` + item.ans.name + `"`;
        users_added = shared_with;
        category = `value="` + is_shared + `"`;
        method = `onclick="editTable(document.getElementById('add-table-form'),` + id + `);"`;
    }

    const mainDisplay = document.querySelector("#feature-display");
    mainDisplay.innerHTML = `
    <div class="mt-10 w-full flex flex-col items-center h-full">
        <form class="flex flex-col lg:flex-row gap-7 h-full w-full" id="add-table-form">
            <div class="h-full w-full flex flex-col items-center gap-3">
                <div class="gap-3 flex flex-col w-1/5">
                    <label class="special-text tracking-wider text-indigo-100 text-lg font-bold  " >Name:</label>
                    <input type="text" name="name" id="name" ` + name + ` class="border-b-2 border-yellow-300  p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md">
                </div>
                
                <div class="gap-3 flex flex-col w-1/5">
                    <label class="special-text tracking-wider text-indigo-100 text-lg font-bold " >Add User:</label>
                    <input type="text" name="user-email" id="user-email" class="border-b-2 border-yellow-300 p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md">
                    </input>
                    <button 
                        class="max-w-md inline-block py-2 px-4 shadow-xl text-background font-black bg-yellow-400 hover:bg-yellow-300 hover:text-white rounded transition ease-in duration-400"
                        type="button" onclick="addUser()">
                            Add
                    </button>
                </div>
                
                <div class="gap-3 flex flex-col w-1/5">
                    <label class="special-text tracking-wider text-indigo-100 text-lg font-bold " >Users Added:</label>
                    <div name="users-field" id="users-field" class="border-b-2 border-yellow-300 p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md disabled">
                        ${users_added}
                    </div>
                    <input type="hidden" id="users-added"  value="` + users_added + `">
                </div>

                <div class="gap-3 flex flex-col w-1/5">
                    <label class="special-text tracking-wider text-indigo-100 text-lg font-bold " >Category:</label>
                    <select name="category" id="category" ` + category + ` class="border-b-2 border-yellow-300 p-2 bg-transparent border-0 text-white tracking-wider flex-shrink max-w-md">
                        <option value="Private">Personal</option>
                        <option value="Shared">Shared</option>
                    </select>
                </div>
        
                <input
                    type="button"
                    class="max-w-md inline-block py-2 px-4 shadow-xl text-background font-black bg-yellow-400 hover:bg-yellow-300 hover:text-white rounded transition ease-in duration-400"
                    value="Submit"
                     ` + method + ` 
                >
                <script>
                    document.addEventListener("submit", (e) => {
        
                        e.preventDefault();
                    });
                </script>
            </div>

        </form>
    </div>
    `;

    if (item === undefined) {
        state = "addForm";
    } else {
        state = "editForm";
    }
}
