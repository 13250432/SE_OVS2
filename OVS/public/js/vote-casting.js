async function submitVote() {
    if (!getSelected()) {
        return;
    }

    // submission confirmation
    if (!confirm('You cannot edit your choice(s) once submitted. Confirm?')) {
        return;
    }

    const postRequest = await fetch(
        '/submit-vote', {
            method: 'post',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
                vote_id: document.getElementById('vote-id').value,
                selected: selected
            })
        }
    ).then((res) => {
        // res.json() is a promise so results has to be passed to the next then() i think
        return res.json();
    }).then((res) => {
        window.location = res.redirect;
    });

    // https://stackoverflow.com/questions/51859358/how-to-read-json-file-with-fetch-in-javascript
}

function getSelected() {
    // get choice values from the document
    let choiceElements = document.getElementsByName('selected-choices');
    let choices = [];
    for (let i = 0; i < choiceElements.length; i++) {
        if (choiceElements[i].checked) {
            choices.push(choiceElements[i].value);
        }
    }

    // warn if no choices are selected
    if (choices.length <= 0) {
        alert('Please make selection(s) before submitting.');
        return false;
    }

    selected = choices;
    return true;
}

// selected choices array (set by getSelected())
var selected = [];
