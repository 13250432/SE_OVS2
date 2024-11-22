// #region requires

const express = require('express');
const mongoose = require('mongoose');

// adds access to req.body to read POST requests
// middleware is needed to read specific body Content-Type
// https://expressjs.com/en/resources/middleware/body-parser.html
const bodyParser = require('body-parser');

// allows temporarily saving account details on the client side as cookies
// https://www.npmjs.com/package/cookie-session
const cookieSession = require('cookie-session');

// require self-defined controllers
// https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/routes#create_the_catalog_route_module
const loginController = require('./controllers/login-controller.js');
const voteController = require('./controllers/vote-controller.js');

// #endregion

// #region setups

const app = express();
const mongoDBUri = `${process.env.MONGODB_URI}`;

// #endregion

// #region models

const voteSchema = require('./models/vote-schema');
const voteModel = mongoose.model('vote', voteSchema);

const accountSchema = require('./models/account-schema');
const accountModel = mongoose.model('account', accountSchema);

// #endregion models

// use EJS as the view engine
// https://expressjs.com/en/5x/api.html#app.set
app.set('view engine', 'ejs');

// TODO: use express routers to separate each page's logic into its own file
// https://expressjs.com/en/guide/routing.html

// include directories public files
app.use(express.static('public'));

// read body as json ('Content-Type': 'application/json')
// this is useful for fetch() requests
app.use(bodyParser.json());

// read body as urlencoded ('Content-Type': 'application/x-www-form-urlencoded')
// this is particularly useful for reading form bodies of html/ejs
app.use(bodyParser.urlencoded({ extended: true }));

// use cookie to store logged in account data
app.use(cookieSession({
	name: 'session',
	keys: ['group42', 'group42ovs'],
	maxAge: 1000 * 60 * 60 * 24 // math
}));

// route to home page (default)
app.get('/', loginController.handleGuest, async (req, res) => {
	let account = await accountModel.findOne({ username: req.session.username }).exec();
	let votes = await voteModel.find();

	res.status(200).render('index', {
		index: {
			title: 'Home',
			page: 'home.ejs',
			username: account.username,
			loggedIn: req.session.loggedIn
		},
		page: {
			votes: votes,
			admin: account.admin
		}
	});
});

// #region logins

app.get('/registration', loginController.handleGetRegistration);

app.get('/login', loginController.handleGetLogin);

// when the 'register' button is pressed
app.post('/register', loginController.handlePostRegistration);

// when the 'log in' button is pressed
app.post('/log-in', loginController.handlePostLogin);

app.post('/log-out', loginController.handlePostLogout);

// #endregion

// #region votes

app.get('/vote-creation', loginController.handleGuest, voteController.handleGetVoteCreation);

app.post('/create-vote', voteController.handlePostVoteCreation);

app.post('/view-vote', voteController.handlePostVoteViewing);

app.post('/submit-vote', voteController.handlePostVoteSubmission);

app.post('/delete-vote', voteController.handlePostVoteDeletion);

app.post('/announce-result', voteController.handlePostVoteAnnouncement);

// #endregion

/*
	404
	put this at the end of the request stack.
	https://expressjs.com/en/starter/faq.html
	https://stackoverflow.com/questions/6528876/how-to-redirect-404-errors-to-a-page-in-expressjs
*/
app.use((req, res) => {
	res.status(404).render('index', {
		index: {
			title: '404',
			page: 'not-found.ejs',
			username: req.session.username,
			loggedIn: req.session.loggedIn
		}
	});
});

async function initMongoose() {
	await mongoose.connect(mongoDBUri);
	console.log('mongoose: connected to mongodb!');
}

initMongoose()
	.then()
	.catch((error) => {
		console.log(error);
	})
	.finally();

app.listen(process.env.PORT);
console.log(`listening on port: ${process.env.PORT}`);
