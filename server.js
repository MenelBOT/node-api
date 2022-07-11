/* eslint-disable no-unused-vars */
const fs = require("fs");
const express = require("express");
const api = express();
const programmingLanguagesRouter = require("./routes/main");
const {
	EXPRESSPORT,
	DBURL,
	DBPORT,
	DBNAME,
	DBUSERNAME,
	DBPASSWORD
} = require("./config.dev.json");

let { EXPRESSURL } = require("./config.dev.json");

if (EXPRESSURL.endsWith("/")) EXPRESSURL = EXPRESSURL.slice(0, -1);

if (fs.existsSync("./routes/secret.js")) {
	const secretRouter = require("./routes/secret");
	api.use("/secret", secretRouter);
} else console.log("Running in public mode!");

api.use(express.json());

api.use(
	express.urlencoded({
		extended: true
	})
);

api.get("/", (request, response, next) => {

	response.statusCode = 200;
	response.json({
		message: "ok",
		version: "0.0.5",
		data: {
			message: "Request recieved, welcome to the server!"
		}
	});
});

api.use("/programming-languages", programmingLanguagesRouter);

api.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	console.error(err.message, err.stack);
	res.status(statusCode).json({ message: err.message });
	return;
});

api.listen(EXPRESSPORT, () => {
	console.log(`Server started on port: ${EXPRESSPORT}\nApi is now listening for requests at ${EXPRESSURL}:${EXPRESSPORT}/`);
});