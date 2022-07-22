const db = require("./db.js");
const config = require("../config.dev.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

async function createOne(username, email, password) {

	const token = jwt.sign({ username: username, email: email, password: password }, config.PRIVATEKEY, { expiresIn: "15m" });

	const result = await db.query("INSERT INTO users (username, email, password, token, permissions) VALUES (?, ?, ?, ?, ?)", [username, email, bcrypt.hashSync(password, 10), token, JSON.stringify({ permissions: [] })]);

	if (result.affectedRows) return { message: "User successfully registered!", token: token, expiresIn: `This token will expire at ${new Date(Date.now() + (15 * 60000))}` };
	else return { error: "Error in users createOne()" };
}

module.exports = {

	createOne

};