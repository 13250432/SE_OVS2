// frontend

const choiceElementFieldClassName = 'choice-title';

function addChoice() {
	// get choice list (ul) from the document
	let choicesElement = document.getElementById('choices');

	// add a new choice element (li)
	let newChoiceElement = document.createElement('li');
	newChoiceElement.className = 'choice';

	// add input field for the new choice element
	let newChoiceElementField = document.createElement('input');
	newChoiceElementField.className = choiceElementFieldClassName;
	newChoiceElementField.type = 'text';
	newChoiceElementField.placeholder = 'Enter Choice Title...';
	newChoiceElementField.setAttribute('form', 'publish-vote');
	newChoiceElementField.required = true;
	newChoiceElement.appendChild(newChoiceElementField);
	
	// add remove button for the new choice element
	// https://stackoverflow.com/questions/63222585/running-script-with-parameter-when-item-is-clicked
	let newChoiceElementRemove = document.createElement('button');
	newChoiceElementRemove.className = 'choice-remove';
	newChoiceElementRemove.onclick = () => { newChoiceElement.remove(); };
	newChoiceElement.appendChild(newChoiceElementRemove);

	// add remove button icon inside of the remove button
	let newChoiceElementRemoveIcon = document.createElement('span');
	newChoiceElementRemoveIcon.className = 'material-symbols-outlined icon';
	newChoiceElementRemoveIcon.textContent = 'delete';
	newChoiceElementRemove.appendChild(newChoiceElementRemoveIcon);

	// append newChoice to choiceList
	choicesElement.appendChild(newChoiceElement);
}

async function publishVote() {
	console.log('publish');

	if (!getTopic()) {
		return;
	} else if (!getChoices()) {
		return;
	} else if (!getEndDate()) {
		return;
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
	const postRequest = await fetch(
		'/create-vote',
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(bodyJSON)
		}
	).then((res) => {
        return res.json();
    }).then((res) => {
        window.location = res.redirect;
    });
}

var bodyJSON = {
	topic: null,
	choices: null,
	multiple: null,
	endDate: null
};

function getTopic() {
	let topicElement = document.getElementById('topic');
	let topic = topicElement.value.trim();
	
	// alert if topic doesn't exist or is empty
	if (!topic) {
		alert('Please fill in the topic.');
		return false;
	}

	bodyJSON.topic = topic;
	return true;
}

function getChoices() {
	let choiceElements = document.getElementById('choices').getElementsByTagName('li');
	let choices = [];

	for (i = 0; i < choiceElements.length; i++) {
		// get choice title
		let choiceTitle = choiceElements.item(i)
						  .getElementsByClassName(choiceElementFieldClassName).item(0)
						  .value.trim();

		// alert if choiceTitle doesn't exist or is empty
		if (!choiceTitle) {
			alert('Some choice titles are empty. Please fill in the choice titles.');
			return false;
		}

		// push each choice to choices
		choices.push({
			title: choiceTitle,
			voteCount: 0
		});
	}

	// alert if there are no choices
	if (choices.length <= 0) {
		alert('Please add at least 1 choice.');
		return false;
	}

	bodyJSON.choices = choices;
	bodyJSON.multiple = document.getElementById('multiple').checked;
	return true;
}

// TODO: BUG: use global time
function getEndDate() {
	let endDateElement = document.getElementById('end-date');
	let endDate = endDateElement.value;
	let nowDate = new Date(Date.now()).toISOString().substring(0, 19);
	
	// alert if endDate doesn't exist or is invalid
	if (!endDate) {
		if (!confirm('You have not entered the End Date. Continue without the End Date?')) {
			return false;
		}
	} else {
		if (endDate < nowDate) {
			alert('Please fill in a valid end date.');
			return false;
		}
	}

	bodyJSON.endDate = endDate;
	return true;
}
