const mongoose = require('mongoose');

const voteSchema = require('../models/vote-schema');
const voteModel = mongoose.model('vote', voteSchema);

const accountSchema = require('../models/account-schema');
const accountModel = mongoose.model('account', accountSchema);

module.exports.handleGetVoteCreation = async (req, res) => {
	let account = await accountModel.findOne({ username: req.session.username }).exec();

	// redirect to home page if not admin
	if (!account.admin) {
		res.status(200).redirect('/');
		return;
	}

	res.status(200).render('index', {
		index: {
			title: 'Vote Creation',
			page: 'vote-creation.ejs',
			username: req.session.username,
			loggedIn: req.session.loggedIn
		}
	});
}

module.exports.handlePostVoteCreation = async (req, res) => {
	let vote = new voteModel({
		topic: req.body.topic,
		choices: req.body.choices,
		multiple: req.body.multiple,
		author: req.session.username,
		creationDate: Date.now(),
		endDate: req.body.endDate,
		endDateFormatted: formatDate(new Date(req.body.endDate)),
		resultAnnounced: false,
		voteCount: 0
	});

	await vote.validate();
	await vote.save();

	console.log('createVote(): saved successfully!');

	res.status(200).json({ redirect: '/' });
}

module.exports.handlePostVoteViewing = async (req, res) => {
	let vote = await voteModel.findOne({ _id: req.body.vote_id }).exec();

	// TODO: use ui/text to inform nonexistent vote instead
	if (!vote) {
		res.status(200).redirect('/');
		return;
	}

	let account = await accountModel.findOne({ username: req.session.username }).exec();

	// render vote-analysis.ejs if is admin
	if (account.admin) {
		res.status(200).render('index', {
			index: {
				title: 'Vote Analyzing',
				page: 'vote-analysis.ejs',
				username: req.session.username,
				loggedIn: req.session.loggedIn
			},
			page: {
				vote: vote,
				resultAnnounced: isVoteResultAnnounced(vote),
				over: isVoteOver(vote)
			}
		});
	}
	
	// render vote-viewing if is not admin (voter)
	else {
		// if vote is invalid
		if (
			hasVoted(account, vote)
			|| isVoteResultAnnounced(vote)
			|| isVoteOver(vote)
		) {
			// find selected choices of this vote from this account
			let selected = [];
			for (let v of account.votes) {
				if (v.voteId.equals(vote._id)) {
					selected = v.selected;
					break;
				}
			}

			res.status(200).render('index', {
				index: {
					title: 'Vote Viewing',
					page: 'vote-viewing.ejs',
					username: req.session.username,
					loggedIn: req.session.loggedIn
				},
				page: {
					vote: vote,
					selectedIds: selected,
					resultAnnounced: isVoteResultAnnounced(vote)
				}
			});
		}
		
		// if vote is valid
		else {
			res.status(200).render('index', {
				index: {
					title: 'Vote Casting',
					page: 'vote-casting.ejs',
					username: req.session.username,
					loggedIn: req.session.loggedIn
				},
				page: {
					vote: vote,
				}
			});
		}
	}
};

module.exports.handlePostVoteSubmission = async (req, res) => {
	let account = await accountModel.findOne({ username: req.session.username }).exec();
	let vote = await voteModel.findOne({ _id: req.body.vote_id }).exec();

	// append choice _id to selected
	// increment voteCount of choice by 1
	let selected = [];
	for (let sid of req.body.selected) {
		selected.push(sid);

		// https://stackoverflow.com/questions/16037788/mongodb-increment-value-inside-nested-array
		await voteModel.updateOne(
			{ _id: vote._id, 'choices._id': sid },
			{ $inc: { 'choices.$.voteCount': 1 } }
		);
	}

	// save selected vote choices into account's db
	account.votes.push({
		voteId: vote._id,
		selected: selected
	});
	await account.save();
	console.log('successfully save selected vote choices into account!');

	// this post request is made from a fetch() call, res.redirect() won't work here and requires fetch() to do the work instead.
	// https://stackoverflow.com/questions/41078641/how-to-properly-redirect-in-nodejs-expressjs/41078774#41078774
	res.status(200).json({ redirect: '/' });
};

module.exports.handlePostVoteDeletion = async (req, res) => {
	await voteModel.deleteOne({ _id: req.body.vote_id });
	res.status(200).json({ redirect: '/' });
};

module.exports.handlePostVoteAnnouncement = async (req, res) => {
	await voteModel.updateOne(
		{ _id: req.body.vote_id },
		{ resultAnnounced: true }
	);
	res.status(200).json({ redirect: '/' });
};

function hasVoted(account, vote) {
	// if account has already voted for this vote
	for (let v of account.votes) {
		if (v.voteId.equals(vote._id)) {
			console.log('vote has already been casted');
			return true;
		}
	}
	return false;
}

function isVoteResultAnnounced(vote) {
	return vote.resultAnnounced;
}

function isVoteOver(vote) {
	return (vote.endDate && vote.endDate < Date.now());
}

function formatDate(date) {
	if (!date || isNaN(date)) {
		return '';
	}

	date = new Date(date);

	let year = date.getFullYear();
	let month = date.getMonth();
	let day = date.getDate();
	let hours = date.getHours();
	let minutes = date.getMinutes();

	return `${day}/${month}/${year} (${hours}:${minutes})`;
}
