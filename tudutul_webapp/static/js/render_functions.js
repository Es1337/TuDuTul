import { repetitionTable, TUDU_CARD_CLASSLIST, TUDU_COLLAPSIBLE_CLASSLIST, formatDate, getDate, insertAt, getItemIndex } from './settings.js'

const categoryTable = {
    "P": "Personal",
    "W": "Work",
    "F": "Family"
}

const fillDateInnerHTML = async date => {
    const dateDisplay = await document.querySelector("#day-display");
    dateDisplay.innerHTML = `The day is: ${date}`;
}

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

// Arrow function to create button's (in our case, TuDu card's) innerHTML
// IMPORTANT: The button itself has different CSS styling, specified in TUDU_CARD_CLASSLIST constant
const fillButtonInnerHTML = item => {
    const checked = item.is_done == true ? 'checked' : null;
    const priorityHTML = createPropertyHTML(item.priority);

    const category = (item.category === 'P' || item.category === 'W' || item.category === 'F') ? categoryTable[item.category] : item.category; 

    return `<div class="px-4 mx-auto mb-1 flex justify-between items-center">
                <p class="font-black text-white tracking-wide text-2xl">${item.name}</p>
                <input type="checkbox" ${checked} disabled>
            </div>
            <p class="mx-4 ${item.creator !== "You" ? '' : 'mb-2'} font-bold text-left text-md text-yellow-300">${item.creation_date_hour}</p>
            ${item.creator !== "You" ? `<p class="mx-4 mb-2 font-bold text-left text-md text-white">Author:<span class="text-yellow-200"> ${item.creator}</span></p>` : ''}
            <div class="cardDetails mx-auto px-4 flex items-center justify-around">
                <div class="w-full h-full font-bold  text-sm text-yellow-200">${category}</div>
                ${item.repetition !== "N" 
                    ? `<div class="w-full h-full font-bold  text-sm text-yellow-200">${repetitionTable[item.repetition]}</div>` : ''}
                <div class="w-full h-full text-sm">` +
                    priorityHTML + 
                `</div>
            </div>`;
}

// Arrow function to create HTML associated with priority of a card
const createPropertyHTML = priority => {
    priority = parseInt(priority, 10);
    switch(priority) {
        case 1:
            return `<i class="fas fa-exclamation text-yellow-200"></i>`;
            break;
        case 2:
            return `<i class="fas fa-exclamation text-yellow-300"></i>
                    <i class="fas fa-exclamation text-yellow-300"></i>`;
        case 3:
            return `<i class="fas fa-exclamation text-red-500"></i>
                    <i class="fas fa-exclamation text-red-500"></i>
                    <i class="fas fa-exclamation text-red-500"></i>`;
        default:
            console.error("WRONG VALUE OF PRIORITY");
            break;
    }
}


// Function to create innerHTML of the collapsible button's content
// IMPORTANT: The button itself has different CSS styling, specified in TUDU_CARD_CLASSLIST constant
const fillCollapsibleInnerHTML = item => {
    return `<div class="bg-white p-2 pt-4 mx-3 mb-3 block max-w-full font-medium specialtext  rounded-b-xl">${item.content}</div>
            <div class="px-3 pb-3 flex justify-end items-center">
                <i class="editIcon my-1 px-2 fas fa-edit text-md sm:text-lg text-white cursor-pointer"></i>
                <i class="deleteIcon my-1 fas fa-trash-alt text-md sm:text-lg text-white cursor-pointer"></i>
            </div>`;
}

// TODO: Change the code up there to template maybe -> possibility for one file with HTML for buttons / cards
const createButtonHTML = item => {
    const button = document.createElement('button');
    button.classList.add(...TUDU_CARD_CLASSLIST);
    button.innerHTML = fillButtonInnerHTML(item);
    return button;
} 

const setOverlaySection = async (section, text) => {
    const overlaySection = document.querySelector(`#overlay${section}`);
    overlaySection.innerHTML = text;
}

const resetOverlay = async () => {
    setOverlaySection('Header', '');
    setOverlaySection('Text', '');
    setOverlaySection('Buttons', '');
}

const turnOnModal = async () => {
    const infoOverlay = document.querySelector("#infoOverlay");
    infoOverlay.style.display = "flex";
}

const turnOffModal = async () => {
    const infoOverlay = document.querySelector("#infoOverlay");
    infoOverlay.style.display = "none";
    resetOverlay();
}

// THIS FUNCTION IS POORLY WRITTEN, YOU NEED TO ADD EVENT LISTENER OUTSIDE OF IT TO FUNCTIONBUTTOn
const renderModal = (header, text, functionButtonText) => {

    let buttonsHTML = `<button
                            id="turnOffButton"
                            class="max-w-md inline-block py-2 px-4 mr-2 shadow-xl text-background font-black bg-indigo-200 hover:bg-indigo-100 rounded transition ease-in duration-400"
                        >X</button>`;

    if (functionButtonText !== undefined) {
        buttonsHTML += `<button
        id="functionButton"
        class="max-w-md inline-block py-2 px-2 shadow-xl text-background font-black bg-yellow-400 hover:bg-yellow-300 hover:text-white rounded transition ease-in duration-400"
    >${ functionButtonText }</button>`;
    }

    setOverlaySection('Header', header);
    setOverlaySection('Text', text);
    setOverlaySection('Buttons', buttonsHTML);

    const turnOffButton = document.querySelector("#turnOffButton");
    turnOffButton.addEventListener("click", () => {
        turnOffModal();
    })



    turnOnModal();
}

const checkCompletionDateRead = () => {
    const repetitionBox = document.querySelector("#repetition");
    const completionDateBox = document.querySelector("#completion_date");
    if (repetitionBox.value === "N") {
        completionDateBox.value = "";
        completionDateBox.setAttribute('disabled', true);
    } else {
        completionDateBox.removeAttribute('disabled');
    }

    console.log(completionDateBox.getAttribute('disabled'));
}



 /* -------------------------- MODULE RENDERING FUNCTIONS -------------------------- */


export { fillDateInnerHTML, createCollapsibles, fillButtonInnerHTML, createPropertyHTML, fillCollapsibleInnerHTML,
    createButtonHTML, setOverlaySection, resetOverlay, turnOnModal,
    turnOffModal, renderModal, checkCompletionDateRead }