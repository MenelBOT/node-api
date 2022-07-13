const db = require("./db");

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const salt = bcrypt.genSaltSync();

async function hashPassword(passwordToHash) { return bcrypt.hashSync(passwordToHash, salt); }

async function generateToken() {

	const string = crypto.randomBytes(30).toString("hex");

	const hash = await hashPassword(string);

	await db.query(`CREATE TABLE IF NOT EXISTS tokens (
		id int(10) unsigned AUTO_INCREMENT,
		value varchar(255) UNIQUE NOT NULL,
		PRIMARY KEY (id)
	)`);

	await db.query(`INSERT INTO tokens (value) VALUES ("${hash}")`);


}

async function destroyToken(token) {

	const result = await db.query(`DELETE FROM tokens WHERE value="${token}"`);

	if (result.affectedRows) return true;

	return false;

}

async function compareToken(token) {

	// This might be a bad way of doing this but it's not really something I'd do in production anyway

	const result = await db.query(`SELECT count(*) FROM tokens WHERE value="${token}"`);

	if (result.length > 0) return true;

	return false;

}

module.exports = {
	generateToken,
	destroyToken,
	compareToken
};