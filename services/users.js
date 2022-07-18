const db = require("./db.js");
const helper = require("./pagehelper.js");
const config = require("../config.dev.json");
const jwt = require("jsonwebtoken");
const registerModel = require("../models/registerRequest");
const bcrypt = require("bcryptjs");

async function createOne(username, email, password) {

	console.log("Creating token");
	const token = jwt.sign({ username: username, email: email, password: password }, config.PRIVATEKEY, { expiresIn: "15m" });
	console.log("Created token\nQuerying");

	/*
	`INSERT INTO programming_languages
		(name, released_year, githut_rank, pypl_rank, tiobe_rank) 
		VALUES
		(${programmingLanguage.name}, ${programmingLanguage.released_year}, ${programmingLanguage.githut_rank}, ${programmingLanguage.pypl_rank}, ${programmingLanguage.tiobe_rank})`
	*/
	const result = await db.query(`INSERT INTO users (username, email, password, token) VALUES (${username}, ${email}, ${bcrypt.hashSync(password, 10)}, ${token})`);
	console.log("Query done");
	if (result.affectedRows) return { message: "User successfully registered!", token: token, expiresIn: `This token will expire at ${new Date(Date.now() + (15 * 60000))}` };
	else return { error: "Error in users createOne()" };
}

module.exports = {

	createOne

};