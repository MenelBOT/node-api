/* eslint-disable no-unused-vars */
const fs = require("fs");
const swaggerUI = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const swaggerOptions = {

	definition: {
		openapi: "3.0.0",
		info: {
			title: "Node API - Programming languages ranking",
			version: "0.2.2",
			description: "An Express API for NodeJS for storing and displaying programming languages ranked by an array of sources"
		},
		servers: [
			{
				url: "http://localhost:2030",
				description: "Development server"
			}
		]
	},
	apis: ["./server.js", "./routes/main.js"]
};

const specs = swaggerJSDoc(swaggerOptions);
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

api.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

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


/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - email
 *         - password
 *         - token
 *         - permissions
 *       properties:
 *         id:
 *           type: Integer
 *           description: The automatically generated ID of the user
 *         username:
 *           type: String
 *           description: The name of the user
 *         email:
 *           type: Email
 *           description: The e-mail address of the user
 *         password:
 *           type: Hash
 *           description: The hashed password of the user
 *         token:
 *           type: JWT
 *           description: The latest JsonWebToken of the user, used for authenticating database write requests
 *         permissions:
 *           type: Object
 *           description: The object containing the array of permissions the user has. This field is used to authorize database write requests
 *         created_at:
 *           type: Date
 *           description: The server date to the second of exactly when was the user account created
 *       example:
 *         id: 1
 *         username: Example
 *         email: example@example.com
 *         password: 1h+mXx4SVDvzBvXHpgRiPfSP1Ek=
 *         token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *         permissions: { "permissions": ["CREATE USER", "CREATE LANGUAGE", "DELETE LANGUAGE"] }
 *         created_at: 2022-07-18 20:42:06
 *     Programming language:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - released_year
 *         - githut_rank
 *         - pypl_rank
 *         - tiobe_rank
 *       properties:
 *         id:
 *           type: Integer
 *           description: The automatically generated ID of the programming language
 *         name:
 *           type: String
 *           description: The name of the programming language
 *         released_year:
 *           type: Integer
 *           description: The year in which the programming language was first released
 *         githut_rank:
 *           type: String
 *           description: The rank the language was given in the githut ranking
 *         pypl_rank:
 *           type: String
 *           description: The rank the language was given in the pypl ranking
 *         tiobe_rank:
 *           type: String
 *           description: The rank the language was given in the tiobe ranking
 *         created_at:
 *           type: Date
 *           description: The server date to the second of exactly when the language was added to the database
 *         updated_at:
 *           type: Date
 *           description: The server date to the second of exactly when the language was last updated
 */

/**
 * @openapi
 * tags:
 *   name: Users
 *   description: The user account related routes
 */

/**
 * @openapi
 * /register:
 *  post:
 *    parameters:
 *      - in: header
 *        name: Authorization
 *        required: true
 *        schema:
 *          type: string
 *          required: true
 *          example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *    tags: [Users]
 *    summary: Creates a new user of the API
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              username:
 *                type: string
 *                example: exampleUser123
 *              email:
 *                type: string
 *                example: example@domain.com
 *              password:
 *                type: string
 *                example: superSecurePassword1@3
 *    responses:
 *      200:
 *        description: The user has been succesfully created
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  description: The success message
 *                  example: User successfully registered!
 *                token:
 *                  type: hash
 *                  description: The JsonWebToken assigned to the user
 *                  example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *                expiresIn:
 *                  type: string
 *                  description: This field gives the user the date upon which the token will become invalid
 *                  example: This token will expire at Thu Jul 21 2022 00:25:42 GMT+0200 (Central European Summer Time)
 *      400:
 *        description: The request syntax couldn't be parsed by the server correctly and nothing changed in the database
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                errors:
 *                  type: Array
 *                  description: An array containing the errors. The errors can either be strings or a single [object ErrorBag]
 *                  example: ["There already exists an user with that username", "There already exists an user with that email address"]
 *      401:
 *        description: The request did not provide any authorization token
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: This error field tells the user that they have not provided any authorization token
 *                  default: Unauthorized
 *      403:
 *        description: The request provided an authorization token that doesn't have the permission to create users
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *                  description: This error field tells the user that the authorization token they provided doesn't have the permission to create new users
 *                  default: Forbidden
 */

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
	} else return response.status(400).json({ errors: [registerModel.errors().all()] });

});

/**
 * @openapi
 * /login:
 *   post:
 *     tags: [Users]
 *     summary: Generates a new authorization token for the user account with maching credentials
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: The name of the user account you're trying to access
 *                     example: Administrator
 *                   password:
 *                     type: string
 *                     description: The password of the account you're trying to access
 *                     example: rootPasswordHehe68
 *                 required:
 *                   - username
 *                   - password
 *               - type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                     description: The e-mail address of the account you're trying to access
 *                     example: employee@example.com
 *                   password:
 *                     type: string
 *                     description: The password of the account you're trying to access
 *                     example: babyBaby12#
 *                 required:
 *                   - email
 *                   - password
 *     responses:
 *       200:
 *         description: Everything went right and the user receives their new access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The message welcomes their user by their username
 *                   example: Welcome back, Employee0378!
 *                 token:
 *                   type: JWT
 *                   description: The newly generated JsonWebToken that the user can use to authenticate to the server on non read requests
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *                 expiresIn:
 *                   type: string
 *                   description: This field tells the user exactly when will their token expire and they will have to log in again
 *                   example: This token will expire at Thu Jul 21 2022 01:38:24 GMT+0200 (Central European Summer Time)
 *       400:
 *         description: The server could not parse the request body due to malformed syntax
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The password field was ommitted in the request body
 *                   default: No password provided
 *       406:
 *         description: The server rejected the request despite correct syntax, because request body had more parameters than required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The request body has more than two parameters. This is an error implemented for security, as so, the user cannot send additional potentially malicious parameters to the API
 *                   default: Body must be two parameters
 *       422:
 *         description: The server rejected the request because the provided credentials did not match any user in the database
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       description: This error is returned when the user does not specify credentials that match any user in the database
 *                       example: Provided credentials didn't resolve to any registered user
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       description: This error is returned if the username or password field does match an user but the provided password doesn't
 *                       example: Username or password invalid
 */

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