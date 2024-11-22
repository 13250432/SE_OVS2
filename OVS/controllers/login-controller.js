const mongoose = require('mongoose');

const accountSchema = require('../models/account-schema');
const accountModel = mongoose.model('account', accountSchema);

module.exports.handleGetRegistration = (req, res) => {
	// redirect to home page if already logged in
	if (req.session.loggedIn) {
		res.status(200).redirect('/');
		return;
	}

	registerLocals.index.username = req.session.username;
	registerLocals.index.loggedIn = req.session.loggedIn;
	registerLocals.page.warnings = [];

	res.status(200).render('index', registerLocals);
}

module.exports.handleGetLogin = (req, res) => {
	// redirect to home page if already logged in
	if (req.session.loggedIn) {
		res.status(200).redirect('/');
		return;
	}

	loginLocals.index.username = req.session.username;
	loginLocals.index.loggedIn = req.session.loggedIn;
	loginLocals.page.warnings = [];

	res.status(200).render('index', loginLocals);
}

module.exports.handlePostRegistration = async (req, res) => {
	registerLocals.index.username = req.session.username;
	registerLocals.index.loggedIn = req.session.loggedIn;
	registerLocals.page.warnings = [];

	if (!await canRegister(req, res)) {
		return;
	}

	// Boolean() constructor:
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean/Boolean
	let newAccount = new accountModel({
		username: req.body.username,
		password: req.body.password,
		admin: Boolean(req.body.admin),
		votes: []
	});

	await newAccount.validate();
	await newAccount.save();

	console.log('register(): registered successfully!');

	// automatically log in after registration
	this.handlePostLogin(req, res);
};

module.exports.handlePostLogin = async (req, res) => {
	loginLocals.index.username = req.session.username;
	loginLocals.index.loggedIn = req.session.loggedIn;
	loginLocals.page.warnings = [];

	if (!await canLogIn(req, res)) {
		return;
	}

	// set custom cookie session properties
	req.session.username = req.body.username;
	req.session.loggedIn = true;

	console.log('login(): logged in successfully!');

	res.status(200).redirect('/');
}

module.exports.handlePostLogout = (req, res) => {
	// clear cookie session and redirect to "/"
	req.session = null;
	res.status(200).redirect('/');

	console.log('logout(): logged out successfully!');
}

module.exports.handleGuest = (req, res, next) => {
	// redirect to /login if not logged in
	if (!req.session.loggedIn) {
		res.status(200).redirect('/login');
		return;
	}
	next();
}

async function canRegister(req, res) {
	// warn if password does not match confirmation
	let password = req.body.password;
	let confirmation = req.body.confirmation;
	if (password !== confirmation) {
		console.log('register(): password does not match confirmation');

		registerLocals.page.warnings.push('Password does not match confirmation. Please try again.');
		res.status(200).render('index', registerLocals);
		return false;
	}

	// warn if account with inputted username exists already
	let account = await accountModel.findOne({ username: req.body.username }).exec();
	if (account) {
		console.log(`register(): account with username '${req.body.username}' exists already`);

		registerLocals.page.warnings.push('This username is unavailable. Please use another username.');
		res.status(200).render('index', registerLocals);
		return false;
	}

	return true;
}

async function canLogIn(req, res) {
	let found = await accountModel.findOne({ username: req.body.username }).exec();

	// warn if account is not found
	if (!found) {
		console.log('login(): account does not exist');

		loginLocals.page.warnings.push('This account does not exist.');
		res.status(200).render('index', loginLocals);
		return false;
	}

	// warn if inputted password does not match found
	if (req.body.password !== found.password) {
		console.log('login(): incorrect password');

		loginLocals.page.warnings.push('Incorrect username or password. Please try again');
		res.status(200).render('index', loginLocals);
		return false;
	}

	return true;
}

let registerLocals = {
	index: {
		title: 'Registration',
		page: 'registration.ejs',
		username: null,
		loggedIn: null
	},
	page: {
		warnings: []
	}
};

let loginLocals = {
	index: {
		title: 'Login',
		page: 'login.ejs',
		username: null,
		loggedIn: null
	},
	page: {
		warnings: []
	}
};
