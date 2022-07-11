const db = require("./db.js");
const helper = require("./pagehelper.js");
const config = require("../config.dev.json");

async function getSingle(id = 1) {
	let result = await db.query(`SELECT id, name, released_year, githut_rank, pypl_rank, tiobe_rank FROM programming_languages WHERE id=${id}`);

	result = helper.emptyOrRows(result);

	const returnval = {
		data: result
	};

	(result.length == 0) ? returnval["meta"] = { error: "Specified ID doesn't exist in database!" } : returnval["meta"] = { id: id };

	return returnval;
}


async function getMultiple(page = 1) {
	const offset = helper.getOffset(page, config.LISTPERPAGE);
	const rows = await db.query(
		`SELECT id, name, released_year, githut_rank, pypl_rank, tiobe_rank 
    FROM programming_languages LIMIT ${offset},${config.LISTPERPAGE}`
	);
	const data = helper.emptyOrRows(rows);
	const meta = { page };

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
		(${programmingLanguage.name}, ${programmingLanguage.released_year}, ${programmingLanguage.githut_rank}, ${programmingLanguage.pypl_rank}, ${programmingLanguage.tiobe_rank})`
	);

	if (result.affectedRows) return { message: "Programming language created successfully" };

	return { message: "Error in creating programming language" };
}

module.exports = {
	getSingle,
	getMultiple,
	create
};