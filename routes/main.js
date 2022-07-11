// @ts-check

const express = require("express");
const router = express.Router();

const languageranking = require("../services/languages.js");

function validateLanguage(programmingLanguage) {
	return null;
}

function validateBody(requestBody) {
	console.log("Validating body of latest request");
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

router.post("/", async function(request, response) {

	if (request.body.length != 5) return response.status(400).json({ error: "Bad body. Request body must have exactly 5 parameters!" });

	if (!validateBody(request.body)) return response.status(406).send("The given body don't resolve to a correct model.\nPlease doublecheck your request body and if the error continues contact the server administrator.");


	try {

		const result = await languageranking.create(request.body);
		response.status(200).json({ message: "ok", created: result });

	} catch (error) {
		return response.status(400).json({ message: "Database rejected insert operation.\nMake sure the data you provided is corrent." });
	}


});

router.put("/:languageID", async function(request, response) {



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