const db = require("./db.js");
const helper = require("./pagehelper.js");
const config = require("../config.dev.json");
// Intellisense fuckery, delete when pushing to production
// eslint-disable-next-line no-unused-vars
const Language = require("../classes/programmingLanguage");

/**
 *
 * @param {string | number} id
 */
async function getSingle(id) {
	if (typeof id == "number") id = String(id);
	let result = await db.query("SELECT id, name, released_year, githut_rank, pypl_rank, tiobe_rank FROM programming_languages WHERE id = ?", [id]);

	result = helper.emptyOrRows(result);

	const returnval = {
		data: result
	};

	(result.length == 0) ? returnval["meta"] = { error: "Specified ID doesn't exist in database!" } : returnval["meta"] = { id: Number(id) };

	return returnval;
}

/**
 *
 * @param {string | number} page
 */
async function getMultiple(page) {
	if (typeof page == "number") page = String(page);
	const offset = helper.getOffset(page, config.LISTPERPAGE);
	const rows = await db.query(
		`SELECT id, name, released_year, githut_rank, pypl_rank, tiobe_rank 
    FROM programming_languages LIMIT ${offset},${config.LISTPERPAGE}`
	);
	const data = helper.emptyOrRows(rows);
	const meta = { page: Number(page) };

	return {
		data,
		meta
	};
}

async function create(programmingLanguage) {
	const result = await db.query(
		`INSERT INTO programming_languages 
		(name, released_year, githut_rank, pypl_rank, tiobe_rank) 
		VALUES 
		(?, ?, ?, ?, ?)`, [
			programmingLanguage.name,
			programmingLanguage.released_year,
			programmingLanguage.githut_rank,
			programmingLanguage.pypl_rank,
			programmingLanguage.tiobe_rank
		]
	);

	if (result.affectedRows) {
		if (result.insertId) return { message: "Programming language created successfully", id: result.insertId };
		else return { message: "Programming language created successfully" };
	}
	return { message: "Error in creating programming language" };
}

/**
 * @param {Language} programmingLanguage
 */
async function update(programmingLanguage) {

	const result = await db.query(`
		UPDATE programming_languages
		SET name = ?,
		released_year = ?,
		githut_rank = ?,
		pypl_rank = ?,
		tiobe_rank = ?
		WHERE id= ?
	`, [
		programmingLanguage.name,
		programmingLanguage.released_year,
		programmingLanguage.githut_rank,
		programmingLanguage.pypl_rank,
		programmingLanguage.tiobe_rank,
		programmingLanguage.id
	]);

	if (result.affectedRows) return { message: "Programming language updated successfully" };

	return { message: "Error in updating programming language" };

}

/**
 * @param {number | string} id
 */
async function deleteOne(id) {

	const result = await db.query("DELETE FROM programming_languages WHERE id = ?", [id]);

	if (result.affectedRows) return { message: "Programming language deleted successfully" };

	return { message: "Error in deleting proramming language" };

}

module.exports = {
	getSingle,
	getMultiple,
	create,
	update,
	deleteOne
};