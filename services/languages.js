const db = require("./db.js");
const helper = require("../pagehelper.js");
const config = require("../config.dev.json");

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

module.exports = {
	getMultiple
};