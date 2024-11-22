const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    id: mongoose.Schema.ObjectId,
    username: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true
    },
    password: {
        type: String,
        minLength: 3,
        maxLength: 50,
        required: true
    },
    admin: Boolean,
    votes: [{
        // the id for the voted vote, not to be confused with _id.
        voteId: {
            type: mongoose.Schema.ObjectId,
            required: true
        },
        // the ids for the selected choices, not to be confused with _id.
        selected: [{
            type: mongoose.Schema.ObjectId
        }]
    }]
});

module.exports = accountSchema;
