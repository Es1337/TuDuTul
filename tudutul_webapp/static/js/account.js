const validateEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const displayOutputMessage = (message) => {
    var output = document.getElementById("output");
    output.innerHTML = message;
    output.style.display = "block";
}

const hideOutputMessage = () => {
    var output = document.getElementById("output");
    output.style.display = "none";
}

const sendRegistrationData = async formHTML => {
    const form = new FormData(formHTML);
    if (!validateEmail(form.get('email'))) {
        displayOutputMessage("Invalid email!");
        return;
    }
    if (form.get('pass').length === 0 || form.get('pass') != form.get('repeated_pass'))
    {
        displayOutputMessage("Invalid password!");
        return;
    }

    var object = {};
    form.forEach((value, key) => object[key] = value);
    

    try {
        const response = await fetch("/account/register/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(object)
        });
        var jsonOBJ = await response.json();

        var output = "";
        if(jsonOBJ.registered) {
            output = jsonOBJ.ans;
        }
        else {
            output += "Registration failed. ";
            output += jsonOBJ.ans;
        }

        displayOutputMessage(output);
    } catch (error) {
        displayOutputMessage("Client error, try again.");
    }
}

const sendLoginData = async formHTML => {
    const form = new FormData(formHTML);

    if (form.get('password').length === 0)
    {
        displayOutputMessage("Invalid password!");
        return;
    }

    var object = {};
    form.forEach((value, key) => object[key] = value);
    
    try {
        const response = await fetch("/account/login/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(object)
        });
        var jsonOBJ = await response.json();

        var output = "";
        if(jsonOBJ.logged) {
            output = jsonOBJ.ans;
            document.location.href = '/online';
        }
        else {
            output += "Login failed. ";
            output += jsonOBJ.ans;
        }

        displayOutputMessage(output);
    } catch (error) {
        displayOutputMessage("Client error, try again.");
    }
}

const getLoggedUser = async () => {
    
}