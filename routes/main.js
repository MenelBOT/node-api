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

/**
 * @openapi
 * tags:
 *   name: Programming languages
 *   description: The programming language ranking related routes<br>Non GET routes require authentication via JWT and authorization via permissions
 */

/**
 * @openapi
 * /programming-languages:
 *   get:
 *     tags: [Programming languages]
 *     summary: This route gets the queried page of programming languages. Each page contains five programming languages by default
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page of languages to return
 *     responses:
 *       200:
 *         description: The server returns the requested page and if no page was specified, returns the first one
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: Array
 *                   description: The array of programming languages queried from the database
 *                   example: [{"id":6,"name":"PHP","released_year":1995,"githut_rank":8,"pypl_rank":6,"tiobe_rank":8},{"id":7,"name":"C++","released_year":1985,"githut_rank":5,"pypl_rank":5,"tiobe_rank":4},{"id":8,"name":"C","released_year":1972,"githut_rank":10,"pypl_rank":5,"tiobe_rank":1},{"id":9,"name":"Ruby","released_year":1995,"githut_rank":6,"pypl_rank":15,"tiobe_rank":15},{"id":10,"name":"R","released_year":1993,"githut_rank":33,"pypl_rank":7,"tiobe_rank":9}]
 *                 meta:
 *                   type: object
 *                   description: Metadata about the request
 *                   properties:
 *                     page:
 *                       type: integer
 *                       description: The page the user requested
 *                       example: 2
 *       400:
 *         description: The server could not parse the request due to malformed query syntax
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                  type: string
 *                  description: This error tells the user that something was wrong with the request query
 *                  default: The server cannot or will not process the request due bad request
 */
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

/**
 * @openapi
 * /programming-languages/{languageID}:
 *   get:
 *     tags: [Programming languages]
 *     parameters:
 *       - in: path
 *         name: languageID
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The automatically generated ID of the programming language
 *     summary: This route gets the specified programming language
 *     your mom: gay
 *     responses:
 *       200:
 *         description: The server returns the requested programming language
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: Array
 *                   description: A single item array containing the language object
 *                   example: [{"id":1,"name":"JavaScript","released_year":1995,"githut_rank":1,"pypl_rank":3,"tiobe_rank":7}]
 *                 meta:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the served programming language
 *                       example: 1
 *       400:
 *         description: The server cannot or will not process the request due bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: This error shows the user that the specified language ID is invalid
 *                   default: The server cannot or will not process the request due bad request
 */

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

router.use(async (request, response, next) => {
	const token = request.header("x-access-token") || request.header("authentication");

	if (!token) return response.status(403).json({ error: "Forbidden\nThe requested resource requires an access token" });

	// jwt throws an error if verify fails for some reason
	try {

		jwt.verify(token, config.PRIVATEKEY);
		request.authorized = true;
		const perms = await
		db.query(`
		SELECT permissions FROM users WHERE token = ?
		`, [token]);
		request.permissions = JSON.parse(perms[0]["permissions"]).permissions;
		next();

	} catch (error) {

		console.error(error);
		return response.status(403).json({ error: "Forbidden\nThe provided token is invalid" });

	}

});

/**
 * @openapi
 * /programming-langugages:
 *   post:
 *     tags: [Programming languages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the programming language
 *                 example: JavaScript
 *               released_year:
 *                 type: integer
 *                 description: The year of the first release of the language
 *                 example: 1995
 *               githut_rank:
 *                 type: integer
 *                 description: The rank the language was given in the githut ranking
 *                 example: 1
 *               pypl_rank:
 *                 type: integer
 *                 description: The rank the language was given in the pypl ranking
 *                 example: 3
 *               tiobe_rank:
 *                 type: integer
 *                 description: The rank the language was given in the tiobe ranking
 *                 example: 7
 *             required:
 *               - name
 *               - released_year
 *               - githut_rank
 *               - pypl_rank
 *               - tiobe_rank
 *     summary: This route adds a programming language to the ranking (Authorization required)
 *     responses:
 *       200:
 *         description: The provided language was succesfully inserted into the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: The message can either be a generic http code 200 message when the new language ID cannot be resolved or "Programming language created successfully" if the new language ID was found
 *                   default: Programming language created successfully
 *                   always present: true
 *                 created:
 *                   type: integer
 *                   description: The automatically generated ID of the appended language
 *                   example: 1
  *       400:
 *         description: This response signifies the user has made an error constructing the request, the error can be one of the following:<br> - The request body has a different amount of parameters than 5 (error1)<br> - The programming language the user wants to append already exists in the database (error2)<br> - The server couldn't parse the provided parameters (message)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error1:
 *                   type: string
 *                   description: The user has specified an incorrect number of parameters in the request body
 *                   default: Bad body. Request body must have exactly 5 parameters!
 *                 error2:
 *                   type: string
 *                   description: The user has specified parameters that resolve to an already existing programming language. The server also asks the user did they mean to send a PUT request instead of a POST request
 *                   default: There already exists a record with the given name (ID is {languageID}). Did you mean to PUT instead?
 *                   example: There already exists a record with the given name (ID is 5). Did you mean to PUT instead?
 *                 message:
 *                   type: string
 *                   description: The server could not parse the given parameters
 *                   default: Database rejected insert operation.<br>Make sure the data you provided is corrent.
 *       406:
 *         description: The provided parameters did not successfully validate with the programming language schematic
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Refer to default value
 *                   default: The given body don't resolve to a correct model. Please doublecheck your request body and if the error continues contact the server administrator.
 */

router.post("/", async function(request, response) {

	if (Object.keys(request.body).length != 5) return response.status(400).json({ error: "Bad body. Request body must have exactly 5 parameters!" });

	if (!validateBody(request.body)) return response.status(406).json({ error: "The given body don't resolve to a correct model.\nPlease doublecheck your request body and if the error continues contact the server administrator." });

	const someReturnIdk = await db.query("SELECT id FROM programming_languages WHERE name = ?", [request.body.name]);

	if (someReturnIdk.length > 0) return response.status(400).json({ error: `There already exists a record with the given name (ID is ${someReturnIdk[0]["id"]}). Did you mean to PUT instead?` });

	try {

		request.body.name = `"${request.body.name}"`;
		const result = await languageranking.create(request.body);
		result.id ? response.status(200).json({ message: result.message, created: result.id }) : response.status(200).json({ message: "ok" });

	} catch (error) {
		return response.status(400).json({ message: "Database rejected insert operation.\nMake sure the data you provided is correct." });
	}


});

/**
 * @openapi
 * /programming-langugages/{languageID}:
 *   put:
 *     tags: [Programming languages]
 *     summary: This route updates an existing programming language in the ranking (Authorization required)
 *     parameters:
 *       - in: path
 *         name: languageID
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The automatically generated ID of the programming language
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: Integer
 *                 description: The automatically generated ID of the programming language
 *                 example: 1
 *               name:
 *                 type: String
 *                 description: The name of the programming language
 *                 example: JavaScript
 *               released_year:
 *                 type: Integer
 *                 description: The year in which the programming language was first released
 *                 example: 1995
 *               githut_rank:
 *                 type: String
 *                 description: The rank the language was given in the githut ranking
 *                 example: 1
 *               pypl_rank:
 *                 type: String
 *                 description: The rank the language was given in the pypl ranking
 *                 example: 3
 *               tiobe_rank:
 *                 type: String
 *                 description: The rank the language was given in the tiobe ranking
 *                 example: 7
 *             required:
 *               - id
 *               - name
 *               - released_year
 *               - githut_rank
 *               - pypl_rank
 *               - tiobe_rank
 *     responses:
 *       200:
 *         description: The language was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   default: Programming language updated successfully
 *                   description: This message tells the user that the programming language was successfully updated with the specified data
 *                 updated:
 *                   type: object
 *                   description: This object holds the new object stored in the database
 *                   example: {"id": 1, "name": "NotJavaScript", "released_year": 1995, "githut_rank": 1, "pypl_rank": 3, "tiobe_rank": 7 }
 *       400:
 *         description: This response signifies the user has made an error constructing the request, the error can be one of the following:<br> - The ID in the request body doesn't match the ID in the URI (error1)<br> - The provided ID doesn't match an existing record in the database (error2)<br> - The provided language and the language already in the database are an exact match (error3)<br> - The server couldn't parse the provided parameters (error4)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error1:
 *                   type: string
 *                   default: Cannot change programming language ID
 *                 error2:
 *                   type: string
 *                   default: There exists no entry with specified ID
 *                 error3:
 *                   type: string
 *                   default: No difference detected between currently stored entry and request entry
 *                 error4:
 *                   type: string
 *                   default: Given body cannot be resolved to a valid programming language object
 */

router.put("/:languageID", async function(request, response) {

	if (typeof request.body.id != "undefined" && request.body.id != request.params.languageID) return response.status(400).json({ error: "Cannot change programming language ID" });

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

/**
 * @openapi
 * /programming-languages/{languageID}:
 *   delete:
 *     summary: This route deletes the specified programming language from the ranking (Authorization required)
 *     tags: [Programming languages]
 *     parameters:
 *       - in: path
 *         name: languageID
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The automatically generated ID of the programming language
 *     responses:
 *       200:
 *         description: The language has been successfully deleted from the database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A generic http code 200 message
 *                   default: ok
 *       400:
 *         description: The specified programming language ID is not of an acceptable type. language ID must be a number
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   default: Request affected no entry, make sure the language ID is correct and try again
 *       404:
 *         description: No record found with matching ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   default: There exists no entry with specified ID
 */

router.delete("/:languageID", async function(request, response, next) {

	if (validateNumeric(request.params.languageID)) return response.status(400).json({ error: "Request affected no entry, make sure the language ID is correct and try again" });

	try {

		const someReturnIdk = await db.query(`SELECT count(*) FROM programming_languages WHERE id=${request.params.languageID}`);

		// Since primary_key is unique, the return value will always be a boolean value.

		if (!someReturnIdk[0]["count(*)"]) return response.status(404).json({ error: "There exists no entry with specified ID" });

		const result = await languageranking.deleteOne(request.params.languageID);

		if (result.message == "Programming language deleted successfully") return response.status(200).json({ message: "ok" });

		else next(result.message);

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