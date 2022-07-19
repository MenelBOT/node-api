const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("../config.dev.json");

const languageranking = require("../services/languages");

const Language = require("../classes/programmingLanguage");

const db = require("../services/db");

function validateBody(requestBody) {
	if (
		Object.prototype.hasOwnProperty.call(requestBody, "name")
		&& Object.prototype.hasOwnProperty.call(requestBody, "released_year")
		&& Object.prototype.hasOwnProperty.call(requestBody, "githut_rank")
		&& Object.prototype.hasOwnProperty.call(requestBody, "pypl_rank")
		&& Object.prototype.hasOwnProperty.call(requestBody, "tiobe_rank")
	) return true;
	return false;
}

/**
 *
 * @param {string} test
 */
function validateNumeric(test) { return /\d+/gm.test(test); }


router.get("/", async function(request, response, next) {

	try {


		const page = String(request.query.page);

		if (page == "undefined") response.status(200).json(await languageranking.getMultiple(1)); // If no page is specified, default to 1.

		else if (validateNumeric(page)) response.status(200).json(await languageranking.getMultiple(page));

		else response.status(400).json({ error: "The server cannot or will not process the request due bad request" });

	} catch (error) {

		console.error(`An error occured while GETting language ranking: ${error.message}`);

		next(error);

	}

});

router.get("/:languageID", async function(request, response, next) {

	try {

		const id = String(request.params.languageID);

		if (id == "undefined") response.status(200).json(await languageranking.getSingle(1));

		else if (validateNumeric(id)) response.status(200).json(await languageranking.getSingle(id));

		else response.status(400).json({ error: "The server cannot or will not process the request due bad request" });

	} catch (error) {

		next(error);

	}

});

router.use((request, response, next) => {
	const token = request.header("x-access-token") || request.header("authentication");

	if (!token) return response.status(403).json({ error: "Forbidden\nThe requested resource requires an access token" });

	// jwt throws an error if verify fails for some reason
	try {

		jwt.verify(token, config.PRIVATEKEY);
		request.authorized = true;
		next();

	} catch (error) {

		console.error(error);
		return response.status(403).json({ error: "Forbidden\nThe provided token is invalid" });

	}

});

router.post("/", async function(request, response) {

	if (Object.keys(request.body).length != 5) return response.status(400).json({ error: "Bad body. Request body must have exactly 5 parameters!" });

	if (!validateBody(request.body)) return response.status(406).send("The given body don't resolve to a correct model.\nPlease doublecheck your request body and if the error continues contact the server administrator.");

	const someReturnIdk = await db.query("SELECT id FROM programming_languages WHERE name = ?", [request.body.name]);

	if (someReturnIdk.length > 0) {

		const error = `There already exists a record with the given name (ID is ${someReturnIdk[0]["id"]}). Did you mean to PUT instead?`;

		return response.status(400).json({ error: error });
	}

	try {

		request.body.name = `"${request.body.name}"`;
		const result = await languageranking.create(request.body);
		result.id ? response.status(200).json({ message: result.message, created: result.id }) : response.status(200).json({ message: "ok" });

	} catch (error) {
		return response.status(400).json({ message: "Database rejected insert operation.\nMake sure the data you provided is corrent." });
	}


});

router.put("/:languageID", async function(request, response) {

	if (request.body.id != request.params.languageID) return response.status(400).json({ error: "Cannot change programming language ID" });

	const language = Language.validate(request.body);

	if (language) {
		// Language successfully validated

		const someReturnIdk = await db.query(`SELECT count(*) FROM programming_languages WHERE id=${language.id}`);

		// Since primary_key is unique, the return value will always be a boolean value.

		if (!someReturnIdk[0]["count(*)"]) return response.status(400).json({ error: "There exists no entry with specified ID" });

		const currentLanguage = await db.query(`SELECT id, name, released_year, githut_rank, pypl_rank, tiobe_rank FROM programming_languages WHERE id=${language.id}`);
		/*
		Due to mysql2 fuckery it is impossible for me to compare currentLanguage[0][key] to language[key]
		yet somehow this works so I will just keep this as a weird workaround until someone figures out a better way
		to do this
		*/
		const whatTheFuck = currentLanguage[0];

		if (Object.keys(language).every((key) => language[key] === whatTheFuck[key])) return response.status(400).json({ error: "No difference detected between currently stored entry and request entry" });

		else {
			const result = await languageranking.update(language);

			result.message == "Programming language updated successfully" ? response.status(200).json({ message: result.message, updated: language }) : response.status(400).json({ error: result });

		}

	} else return response.status(400).json({ error: "Given body cannot be resolved to a valid programming language object" });

});


router.delete("/:languageID", async function(request, response, next) {

	try {

		const result = await languageranking.deleteOne(request.params.languageID);

		if (result.message == "Programming language deleted successfully") return response.status(200).json({ message: "ok" });

		else return response.status(400).json({ error: "Request affected no rows, make sure the language ID is correct and try again" });

	} catch (error) {

		next(error);

	}

});

/*

DO NOT DELETE!
I am currently unsure will I add more error handlers to this route so I currently keep next declared for convenience.

*/
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {


	console.error(err.stack);

	res.status(500).render("error", { error: err });

});

module.exports = router;