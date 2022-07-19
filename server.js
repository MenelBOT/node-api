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
	PRIVATEKEY,
	PERMISSIONNAMES
} = require("./config.dev.json");
const jwt = require("jsonwebtoken");
const db = require("./services/db");
const registerModel = require("./models/registerRequest");
const users = require("./services/users");
const loginModel = require("./models/loginRequest");
const bcrypt = require("bcryptjs");

let { EXPRESSURL } = require("./config.dev.json");

if (EXPRESSURL.endsWith("/")) EXPRESSURL = EXPRESSURL.slice(0, -1);

function checkWhetherUsernameOrEmail(object) {

	let hasusername = false;
	let hasemail = false;

	if (typeof object.username != "undefined") hasusername = !(hasusername != false); // This call flips the value of the boolean while retaining booleanness unlike ^=
	if (typeof object.email != "undefined") hasemail = !(hasemail != false);

	if (hasusername && hasemail) return -1;
	else if (hasusername) return 0;
	else if (hasemail) return 1;
	else return "What the fuck";

}

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

			const encryptedPassword = await bcrypt.hash(password, 10);

			const result = await users.createOne(username, email, encryptedPassword);

			if ("error" in result) next("The server has experienced an unknown error\nPlease contact the server adminstrator!");

			return response.status(200).json(result);

		} else return response.status(400).json({ errors });
	} else return response.status(400).json({ errors: registerModel.errors().all() });

});

api.post("/login", async function(request, response, next) {

	if (Object.keys(request.body).length == 2) {
		// sent two fields

		// Check which field has the user provided

		const returnval = checkWhetherUsernameOrEmail(request.body);

		// Writing this hurt a bit but oh well
		if (typeof returnval == "string") next("An internal error has occured and the server can't proceed with parsing the input");
		else if (returnval == -1) response.status(400).json({ error: "No password provided" });
		else if (returnval == 0) {

			if (typeof request.body.password == "undefined") return response.status(400).json({ error: "No password provided" });
			const user = await db.query("SELECT id, username, email, password FROM users WHERE username = ? LIMIT 1", [request.body.username]);
			if (user.length == 0) return response.status(422).json({ error: "Provided credentials didn't resolve to any registered user" });

			if (bcrypt.compareSync(request.body.password, user[0].password)) {
				const token = jwt.sign({ username: user[0].username, email: user[0].email, password: user[0].password }, PRIVATEKEY, { expiresIn: "4h" });

				await db.query(`
					UPDATE users
					SET token = ?
					WHERE id = ?
				`, [token, user[0].id]);

				// 																														hours * minutes in an hour * seconds in a minute * miliseconds in a second
				return response.status(200).json({ message: `Welcome back, ${user[0].username}!`, token: token, expiresIn: `This token will expire at ${new Date(Date.now() + (4 * 60 * 60 * 1000))}` });

			} else return response.status(422).json({ error: "Username or password invalid" });

		} else {
			if (typeof request.body.password == "undefined") return response.status(400).json({ error: "No password provided" });
			const user = await db.query("SELECT id, username, email, password FROM users WHERE email = ? LIMIT 1", [request.body.email]);
			if (user.length == 0) return response.status(422).json({ error: "Provided credentials didn't resolve to any registered user" });

			if (bcrypt.compareSync(request.body.password, user[0].password)) {
				const token = jwt.sign({ username: user[0].username, email: user[0].email, password: user[0].password }, PRIVATEKEY, { expiresIn: "4h" });

				await db.query(`
				UPDATE users
				SET token = ?
				WHERE id = ?
				`, [token, user[0].id]);

				return response.status(200).json({ message: `Welcome back, ${user[0].username}!`, token: token, expiresIn: `This token will expire at ${new Date(Date.now() + (4 * 60 * 60 * 1000))}` });

			} else return response.status(422).json({ error: "Provided credentials didn't resolve to any registered user" });

		}

	} else return response.status(406).json({ error: "Body must be two parameters" });

});

// Totally not borrowed code btw
api.use((err, req, res, next) => {
	console.error(err.message, err.stack);
	res.status(err.statusCode || 500).json({ message: err.message });
	return;
});

api.listen(EXPRESSPORT, () => {
	console.log(`Server started on port: ${EXPRESSPORT}\nApi is now listening for requests at ${EXPRESSURL}:${EXPRESSPORT}/`);
});