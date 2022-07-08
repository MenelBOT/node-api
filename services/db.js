const mysql = require("mysql2/promise");
const { DBURL, DBUSERNAME, DBPASSWORD, DBNAME } = require("../config.dev.json");

async function query(sql, parameters) {

	const connection = await mysql.createConnection({ host: DBURL, user: DBUSERNAME, password: DBPASSWORD, database: DBNAME });

	const [results] = await connection.execute(sql, parameters);

	return results;

}

module.exports = {
	query
};