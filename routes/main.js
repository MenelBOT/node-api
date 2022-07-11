const express = require("express");
const router = express.Router();

const languageranking = require("../services/languages.js");


router.get("/", async function(request, response, next) {

	try {

		response.status(200).json(await languageranking.getMultiple(request.query.page));

	} catch (error) {

		console.error(`An error occured while GETting language ranking: ${error.message}`);

		next(error);

	}

});

router.get("/:languageID", async function(request, response, next) {

	try {

		response.status(200).json(await languageranking.getSingle(request.params["languageID"]));

	} catch (error) {

		next(error);

	}

});

router.post("/", async function(request, response) {

	if (request.body.length != 5) return response.status(400).json({ error: "Bad body. Request body must have exactly 5 parameters!" });


	try {
		console.log("Attempting to access headers to resolve to model...");
		console.log(`Language name: ${request.body.name}`);
		console.log(`Released year: ${request.body.released_year}`);
		console.log(`Githut rank: ${request.body.githut_rank}`);
		console.log(`Pypl rank: ${request.body.pypl_rank}`);
		console.log(`Tiobe rank: ${request.body.tiobe_rank}`);
	} catch (error) {
		return response.status(406).send("The given headers don't resolve to a correct model.\nPlease doublecheck your headers and if the error continues contact the server administrator.");
	}

	try {

		const result = await languageranking.create(request.body);
		response.status(200).json({ message: "ok", created: result });

	} catch (error) {
		return response.status(400).json({ message: "Database rejected insert operation.\nMake sure the data you provided is corrent." });
	}


});

router.use((err, req, res, next) => {


	console.error(err.stack);

	res.status(500).render("error", { error: err });

});

module.exports = router;