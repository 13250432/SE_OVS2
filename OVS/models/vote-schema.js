const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
	id: mongoose.Schema.ObjectId,
	topic: {
		type: String,
		minLength: 0,
		maxLength: 500,
		required: true
	},
	choices: [{
		title: {
			type: String,
			required: true
		},
		voteCount: {
			type: Number,
			default: 0
		}
	}],
	multiple: {
		type: Boolean,
		default: false,
		required: true
	},
	author: {
		type: String,
		minLength: 0,
		maxLength: 100,
		default: 'admin',
		required: true
	},
	creationDate: {
		type: Date,
		default: Date.now(),
		required: true
	},
	endDate: Date,
	endDateFormatted: String,
	resultAnnounced: {
		type: Boolean,
		default: false
	}
});

module.exports = voteSchema;
