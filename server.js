/* eslint-disable no-unused-vars */
const fs = require("fs");
const express = require("express");
const api = express();
const programmingLanguagesRouter = require("./routes/main");
const {
	EXPRESSPORT,
	DBURL,
	DBPORT,
	DBNAME,
	DBUSERNAME,
	DBPASSWORD,
	PERMISSIONNAMES
} = require("./config.dev.json");
const jwt = require("jsonwebtoken");
const db = require("./services/db");
const registerModel = require("./models/registerRequest");
const users = require("./services/users");

let { EXPRESSURL } = require("./config.dev.json");

if (EXPRESSURL.endsWith("/")) EXPRESSURL = EXPRESSURL.slice(0, -1);

if (fs.existsSync("./routes/secret.js")) {
	const secretRouter = require("./routes/secret");
	api.use("/secret", secretRouter);
} else console.log("Running in public mode!");

api.use(express.json());

api.use(
	express.urlencoded({
		extended: true
	})
);

api.get("/", (request, response, next) => {

	response.statusCode = 200;
	response.json({
		message: "ok",
		version: "0.0.5",
		data: {
			message: "Request recieved, welcome to the server!"
		}
	});
});

api.use("/programming-languages", programmingLanguagesRouter);


api.post("/register", async function(request, response, next) {

	// Checking if current token was provided in Auth header
	const currentToken = request.header("Authorization");
	if (currentToken === undefined || currentToken === null) return response.status(401).json({ error: "Unauthorized" });

	// Checking if provided token has authorization to create new users

	// result should look like [ { permissions: '{ "permissions": [This array will hold the permissions] }' } ]
	const presult = await db.query(`SELECT permissions FROM users WHERE token="${currentToken}"`);
	/*
	 Permissions should look like { permissions: [This array will hold the permissions] }.
	 Yes this means that you need to call permissions["permissions"] to actually access the array.
	 You can thank MySQL for that as it straight up doesn't have an Array datatype.
	*/
	const permissions = JSON.parse(presult[0]["permissions"]);

	if (!permissions["permissions"].includes(PERMISSIONNAMES.CREATEUSER)) return response.status(403).json({ error: "Forbidden" });

	// Get data from request body
	const { username, email, password } = request.body;

	registerModel.setData({ username: username, email: email, password: password });

	if (registerModel.validate()) {
		// Data has been validated

		// Check if user already exists
		const exists = await db.query(`SELECT username, email FROM users WHERE (username="${username}" AND email="${email}") OR (username="${username}" OR email="${email}")`);

		const errors = [];

		for (const object of exists) {
			if (object.username == username) errors.push("There already exists an user with that username");
			if (object.email == email) errors.push("There already exists an user with that email address");
		}

		if (errors.length == 0) {

			const data = {};

			const result = await users.createOne(username, email, password);

			if (Object.prototype.hasOwnProperty.call(result, "error")) return response.status(500).json({ error: "The server has experienced an unknown error\nPlease contact the server adminstrator!" });

			return response.status(200).json(result);

		}
	} else return response.status(400).json({ errors: registerModel.errors().all() });

});

api.post("/login", async function(request, response, next) {

});

api.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	console.error(err.message, err.stack);
	res.status(statusCode).json({ message: err.message });
	return;
});

api.listen(EXPRESSPORT, () => {
	console.log(`Server started on port: ${EXPRESSPORT}\nApi is now listening for requests at ${EXPRESSURL}:${EXPRESSPORT}/`);
});