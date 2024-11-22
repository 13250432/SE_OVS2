async function deleteVote() {
	if (!confirm('Are you sure you want to delete this vote? This cannot be undone.')) {
		return;
	}

	await fetch(
		'/delete-vote', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				vote_id: document.getElementById('vote-id').value
			})
		}
	).then((res) => {
        return res.json();
    }).then((res) => {
        window.location = res.redirect;
    });
}

async function announceResult() {
	if (!confirm('Are you sure you want to announce the result for this vote? Any further votes cannot be casted.')) {
		return;
	}

	await fetch(
		'/announce-result', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				vote_id: document.getElementById('vote-id').value
			})
		}
	).then((res) => {
		return res.json();
	}).then((res) => {
		window.location = res.redirect;
	});
}
