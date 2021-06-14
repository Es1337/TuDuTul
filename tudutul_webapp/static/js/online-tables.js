import { renderModal } from './render_functions.js'

/* -------------------------- VARIABLES AND CONSTANTS -------------------------- */

let state = "tableDisplay";
let tableList = [];

const TUDU_CARD_CLASSLIST = ['collapsible', 'p-3', 'inline-block', 'relative', 'cardBackground', 'border-yellow-300', 'border-1', 'rounded-3xl', 'cardWidth', 'w-3/6', 'md:w-3/6', 'xl:w-6/10', 'mb-2'];

const TUDU_COLLAPSIBLE_CLASSLIST = ['content', 'w-3/7', 'md:w-3/7', 'xl:w-6/10', 'hidden', 'rounded-b-2xl', 'cardBackground', 'border-yellow-300', 'border-1'];

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

const renderTableDeleteModal = (id) => {
    let headerHTML = `Delete Table`;
    let textHTML = `Do you want to delete the table?`;

    renderModal(headerHTML, textHTML, 'Delete');

    const functionButton = document.querySelector("#functionButton");
    functionButton.addEventListener("click", () => {
        deleteTable(id);
    })
}

const updateTables = () => {
    getFromAPI().then(tablesJSON => {
        tableList = tablesJSON["ans"];
        console.log(tableList);
        getTableDisplayModule();
        renderTables(tableList);
    });
}

updateTables();

const redirectToMain = (id) => {
    window.location.href = "/app?table_id=" + id;
}


/* -------------------------- HTML RENDERING FUNCTIONS -------------------------- */

const createTableCollapsibles = () => {
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

const fillTableButtonInnerHTML = item => {
    let category = item.is_shared ? "Shared" : "Personal";
    return `<div class="px-4 mx-auto mb-1 flex justify-between items-center">
                <p class="font-black text-white tracking-wide text-xl">${item.name}</p>
            </div>
            <div class="mx-auto px-4 flex items-center justify-between">
                <p class="flex font-bold  text-sm text-yellow-300">${category}</p>
            </div>`;
}

const fillTableCollapsibleInnerHTML = item => {
    let users = item.owner;
    item.shared_with.forEach(user => users += '<br>' + user);
    return `<br/>
            <br/>
            <div class="bg-white p-2 mx-3 mb-3 block max-w-full font-medium specialtext  rounded-b-xl">
                <p class="font-bold redMain">Users added:</p>
                ${users}
            </div>
            <div class="px-3 pb-3 flex justify-end items-center">
                <i class="editIcon my-1 px-2 fas fa-edit text-md sm:text-lg text-white cursor-pointer" onclick="getFormModule(${item.id});"></i>
                <i class="deleteIcon my-1 px-2 fas fa-trash-alt text-md sm:text-lg text-white cursor-pointer" onclick="deleteTable(${item.id});"></i>
                <i class="openIcon my-1 px-2 fas fa-arrow-alt-circle-right text-md sm:text-lg text-white cursor-pointer" onclick="redirectToMain(${item.id});"></i>
            </div>`;
}

const createTableCollapsibleHTML = item => {
    const collapsible = document.createElement('div');
    collapsible.classList.add(...TUDU_COLLAPSIBLE_CLASSLIST);
    collapsible.innerHTML = fillTableCollapsibleInnerHTML(item);

    const editTableButton = collapsible.getElementsByClassName("editIcon")[0];
    const deleteTableButton = collapsible.getElementsByClassName("deleteIcon")[0];
    const openTableButton = collapsible.getElementsByClassName("openIcon")[0];

    editTableButton.addEventListener("click", () => {
        getFormModule(item.id);
    })
    deleteTableButton.addEventListener("click", () => {
        renderTableDeleteModal(item.id);
    })
    openTableButton.addEventListener("click", () => {
        redirectToMain(item.id);
    })

    return collapsible;
}

const createTableButtonHTML = item => {
    const button = document.createElement('button');
    button.classList.add(...TUDU_CARD_CLASSLIST);
    button.innerHTML = fillTableButtonInnerHTML(item);
    return button;
}

const renderTables = (tables) => {
    if (state === "addForm" || state === "editForm") return;
    const tablesContainer = document.querySelector("#tablesContainer");

    tablesContainer.innerHTML = '';
  
    tables.forEach(item => {
        const buttonToAdd = createTableButtonHTML(item);
        const collapsibleToAdd = createTableCollapsibleHTML(item);

        tablesContainer.appendChild(buttonToAdd);
        tablesContainer.appendChild(collapsibleToAdd);
    });

    createTableCollapsibles();
  }

  /* -------------------------- TUDU HANDLING FUNCTIONS -------------------------- */

const addTable = async formHTML => {
    const form = new FormData(formHTML);

    let itemToAdd = {};
    form.forEach((value, key) => itemToAdd[key] = value);

    itemToAdd.users_added = formHTML.querySelector("#users-added").value;

    var is_shared = itemToAdd.category === "Shared" ? true : false;
    var shared_with = itemToAdd.users_added.split("<br>");

    sendToAPI(itemToAdd.name, is_shared, shared_with);
    updateTables();
}

const deleteTable = async id => {
    let url = "/table/" + id;
    try {
        const response = await fetch(url, {
            method: 'DELETE'
        });
    
        const deleteJSON = await response.json();
        console.log(await deleteJSON.ans);

        let modalHeader = "Operation successful!";
        if (!response.ok) {
            modalHeader = "Operation failed!";
        }

        renderModal(modalHeader, deleteJSON["ans"]);
    }
    catch(error) {
        renderModal("Operation failed - client side error!", error);
    }

    updateTables();
}

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

    updateTables();
}

 /* -------------------------- TUDU LOADING -------------------------- */

getFromAPI().then(function(result) { 
    renderTables(result.ans);
});


 /* -------------------------- MODULE RENDERING FUNCTIONS -------------------------- */

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

    tableList = getFromAPI().then(function(result) { 
        renderTables(result.ans);
    });
    state = "tableDisplay";
}

const addUser = async () => {
    let userEmail = document.getElementById('user-email').value;
    console.log(userEmail);
    document.getElementById('users-field').innerHTML += userEmail + '<br>';
    document.getElementById('users-added').value += userEmail + '<br>';
}

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
    
    if (item === undefined) {
        state = "addForm";
    } else {
        state = "editForm";
    }

    let name = null;
    let users_added = '';
    let category = null;
    let method = `addTable`;

    if (item !== undefined) {
        var is_shared = item.ans.category ===  true ? "Shared" : "Personal";
        var shared_with = "";
        item.ans.shared_with.forEach(user => shared_with += user + "<br>");
        name = `value="` + item.ans.name + `"`;
        users_added = shared_with;
        category = `value="` + is_shared + `"`;
        method = `editTable`;
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
                        id="addUserButton"
                        class="max-w-md inline-block py-2 px-4 shadow-xl text-background font-black bg-yellow-400 hover:bg-yellow-300 hover:text-white rounded transition ease-in duration-400"
                        type="button">
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
                        <option value="Personal">Personal</option>
                        <option value="Shared">Shared</option>
                    </select>
                </div>
        
                <input
                    type="button"
                    id="formButton"
                    class="max-w-md inline-block py-2 px-4 shadow-xl text-background font-black bg-yellow-400 hover:bg-yellow-300 hover:text-white rounded transition ease-in duration-400"
                    value="Submit"
                     ` + '' + ` 
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
    
    const addUserButton = document.querySelector("#addUserButton");
    console.log(addUserButton);
    addUserButton.addEventListener("click", () => {
        addUser();
    });

    const formButton = document.querySelector("#formButton");
    if (method === "addTable") {
        formButton.addEventListener("click", () => {
            addTable(document.getElementById('add-table-form'));
        })
    } else if (method === "editTable") {
        formButton.addEventListener("click", () => {
            editTable(document.getElementById('add-table-form'), id);
        })
    }
}

const displayButton = document.querySelector("#displayButton");
console.log(displayButton);
displayButton.addEventListener("click", () => {
    getTableDisplayModule();
});

const addButton = document.querySelector("#addButton");
console.log(addButton);
addButton.addEventListener("click", () => {
    getFormModule();
});
