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
    if (form.get('password').length === 0 || form.get('password') != form.get('repeatpassword'))
    {
        displayOutputMessage("Invalid password!");
        return;
    }
    console.log();
    try {
        const response = await fetch("/account/register/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'form': form
            })
        });
        jsonOBJ = await response.json();
        displayOutputMessage("MIELI");
    } catch (error) {
        displayOutputMessage("Client error, try again.");
    }



}

