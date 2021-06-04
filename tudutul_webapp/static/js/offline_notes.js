const createCollapsibles = () => {
    const collapsibles = document.getElementsByClassName("collapsible");
    let i;
    
    for (let i = 0; i < collapsibles.length; i++) {
        collapsibles[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.minHeight){
                content.style.minHeight = null;
                content.style.maxHeight = null;
            } else {
                content.style.minHeight = content.scrollHeight + "px";
                content.style.maxHeight = content.scrollHeight + "px";
            } 
            });
    }
}

createCollapsibles();

class INote {
    constructor(name, creator, content, creation_date, completion_date, priority, owning_table_id, is_done, repetition, category) {
        this.name = name;
        this.creator = creator;
        this.content = content;
        this.creation_date = creation_date;
        this.completion_date = completion_date;
        this.priority = priority;
        this.owning_table_id = owning_table_id;
        this.is_done = is_done;
        this.repetition = repetition;
        this.category = category;
    }
}


class OfflineNote extends INote{
    constructor(name, content, creation_date, completion_date, priority, is_done, repetition, category) {
        super(name, "User", content, creation_date, completion_date, priority, -1, is_done, repetition, category);
    }

    toObject = () => {
        return {
        "name": this.name,
        "creator": this.creator,
        "content": this.content,
        "creation_date": this.creation_date,
        "completion_date": this.completion_date,
        "priority": this.priority,
        "owning_table_id": this.owning_table_id,
        "is_done": this.is_done,
        "repetition": this.repetition,
        "category": this.category
        }
    } 
}

let allTodos = [];

const tuDuContainer = document.querySelector("#tuDuContainer");
const duNeContainer = document.querySelector("#duNeContainer");


const TUDU_CARD_CLASSLIST = ['collapsible', 'p-3', 'inline-block', 'relative', 'cardBackground', 'border-yellow-300', 'border-1', 'rounded-3xl', 'cardWidth', 'w-4/6', 'md:w-3/6', 'xl:w-9/10'];

const TUDU_COLLAPSIBLE_CLASSLIST = ['content', 'w-4/7', 'md:w-3/7', 'xl:w-8/10', 'hidden', 'rounded-b-2xl', 'cardBackground', 'border-yellow-300', 'border-1']

const fillButtonHTML = item => {
    const checked = item.is_done ? 'checked' : null;
    const priorityHTML = createPropertyHTML(item.priority);
    return `<div class="px-4 mx-auto mb-1 flex justify-between items-center">
                <p class="font-black text-white tracking-wide text-xl">${item.name}</p>
                <input type="checkbox" ${checked}>
            </div>
            <p class="mx-4 font-bold text-left text-yellow-300">${item.completion_date}</p>
            <div class="mx-auto px-4 flex items-center justify-between">
                <p class="flex font-bold  text-sm text-yellow-300">${item.category}</p>
                <div>` +
                    priorityHTML + 
                `</div>
            </div>`;
}

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

const fillCollapsibleHTML = item => {
    return `<div class="bg-white p-2 mx-3 mb-3 block max-w-full font-medium specialtext  rounded-b-xl">${item.content}</div>`;
}

const createCollapsibleHTML = item => {
    const collapsible = document.createElement('div');
    collapsible.classList.add(...TUDU_COLLAPSIBLE_CLASSLIST);
    collapsible.innerHTML = fillCollapsibleHTML(item);
    return collapsible;
}

// TODO: Change the code up there to template maybe -> possibility for one file with HTML for buttons / cards

const createButtonHTML = item => {
    const button = document.createElement('button');
    button.classList.add(...TUDU_CARD_CLASSLIST);
    button.innerHTML = fillButtonHTML(item);
    return button;
}

const addTuDu = async formHTML => {
    const form = new FormData(formHTML);
  
    let itemToAdd = {};
    form.forEach((value, key) => itemToAdd[key] = value);
    itemToAdd.creator = "You";
    itemToAdd.creation_date = Date.now();
    itemToAdd.owning_table_id = -1;

    const tuDuLength = allTodos.length;
    let i = 0;
    while (i < tuDuLength) {
        let itemCreationDate = Date.parse(itemToAdd.creation_date);
        if (itemCreationDate < Date.parse(allTodos[i].creation_date)) {
        insertAt(allTodos, i, itemToAdd);
        console.log(allTodos[i]);
        break;
        }
        i++;
    } 
    if (i === tuDuLength) {
        allTodos.push(itemToAdd);
    }
    console.log(itemToAdd);

    saveToLocalStorage(allTodos);
    getFromLocalStorage();
}

const insertAt = (array, index, ...items) => {
  array.splice(index, 0, ...items);
}

let num = [1,2,3,6,7,8];
let insert = [4,5];
insertAt(num, 2, ...insert); // [1,2,4,5,3,6,7,8]
console.log(num);

const renderTodos = (todos) => {
  tuDuContainer.innerHTML = '';
  duNeContainer.innerHTML = '';

  allTodos.forEach(item => {
    const buttonToAdd = createButtonHTML(item);
    const collapsibleToAdd = createCollapsibleHTML(item);
    if (item.is_done) {
      duNeContainer.appendChild(buttonToAdd);
      duNeContainer.appendChild(collapsibleToAdd);
    } else {
      tuDuContainer.appendChild(buttonToAdd);
      tuDuContainer.appendChild(collapsibleToAdd);
    }
  })
}


const getFromLocalStorage = () => {
  const reference = localStorage.getItem('todos');

  if (reference) {
    // convert back from JSON into array
    allTodos = JSON.parse(reference);
    renderTodos(allTodos);
    createCollapsibles();
  }
  console.log("GETTING FROM LOCAL STORAGE");
}

const saveToLocalStorage = (todos) => {
  localStorage.setItem('todos', JSON.stringify(todos));
}

getFromLocalStorage();

console.log(allTodos);