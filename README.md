# Online Voting System (Group 42)

Group Project for Software Engineering

## Running the Online Voting System Locally

### Preparing Files

1. Download [node](https://nodejs.org/en/download/package-manager) into your system if you have not already.
2. Download [this repository](https://github.com/13250432/SE_OVS2) as zip (or clone this repository using git). Unzip if needed.
3. Put ``server.env`` into the same directory as ``server.js`` (which should be this project's root directory).
4. The project directory should look like this afterwards:

```
project
├── /controllers
├── /models
├── /public
├── /views
├── package.json
├── server.env
└── server.js
```

### Starting the Server

5. Open a terminal instance and ``cd`` into the same directory as ``server.js``.
6. run this command: ``npm install``. This ensures the dependencies are set up correctly.
7. run this command: ``npm start``. This will start the server.
8. Note down the port outputted to the terminal. By default it is ``8099``.
9. Enter ``localhost:<port>`` in your browser to access the Online Voting System. You can quickly access through [here](http://localhost:8099).
