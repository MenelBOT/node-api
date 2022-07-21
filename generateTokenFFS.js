const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prompt = require("prompt-sync")({ sigint:true });
const { PRIVATEKEY } = require("./config.dev.json");

try {

	const username = prompt("Input username to sign: ");
	const email = prompt("Input email to sign: ");
	let password = prompt("Input the encrypted password\nIf you don't have a password encrypted input \"a\": ");

	if (password == "a") {
		password = prompt("Input unencrypted password: ");
		password = bcrypt.hashSync(password, 10);
	}

	const token = jwt.sign({ username: username, email: email, password: password }, PRIVATEKEY);

	// Testing validity

	try {

		jwt.verify(token, PRIVATEKEY);

	} catch (error) {
		console.error(error);
		console.log("Somehow we have generated an invalid token, please try again");
	}

	console.log(`Your generated token is: ${token}`);
	console.log("Watch out, as this token will never expire!");

} catch (error) {

	console.log("Something went wrong, please try again");
	console.error(error);

}