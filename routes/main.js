const express = require("express");
const router = express.Router();

const languageranking = require("../services/languages.js");


router.get("/", async function(request, response, next) {

	try {

		response.json(await languageranking.getMultiple(request.query.page));

	} catch (error) {

		console.error(`An error occured while GETting language ranking: ${error.message}`);

		next(error);

	}

});