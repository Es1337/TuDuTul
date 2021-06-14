const repetitionTable = {
    "D": "Daily",
    "W": "Weekly",
    "M": "Monthly",
    "Y": "Yearly"
};

const TUDU_CARD_CLASSLIST = ['collapsible', 'p-3', 'inline-block', 'relative', 'cardBackground', 'border-yellow-300', 'border-1', 'rounded-3xl', 'cardWidth', 'w-4/6', 'md:w-3/6', 'xl:w-8/10'];

const TUDU_COLLAPSIBLE_CLASSLIST = ['content', 'mb-2', 'w-4/7', 'md:w-3/7', 'xl:w-7/10', 'hidden', 'rounded-b-2xl', 'cardBackground', 'border-yellow-300', 'border-1'];

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
    const address = window.location.search;
  
    // Returns a URLSearchParams object instance
    const parameterList = new URLSearchParams(address);

    let date = formatDate(Date.now());

    if (parameterList.has("date")) {
        date = parameterList.get("date");
    }

    return date;
}

// Function that returns a TuDu's index in the 'allTodos' array
const getItemIndex = (id, todos) => {
    const length = todos.length;

    for (let i = 0; i < length; i++) {
        if (todos[i].id == id) {
            return i;
        }
    }

    return null;
}

// Arrow function allowing us to insert item in array on specific index 
const insertAt = (array, index, ...items) => {
    array.splice(index, 0, ...items);
}

export { repetitionTable, TUDU_CARD_CLASSLIST, TUDU_COLLAPSIBLE_CLASSLIST, formatDate, getDate, insertAt, getItemIndex }