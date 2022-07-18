const { make, Password } = require("simple-body-validator");

// This only as default
const fields = {
	username: "JohnDoe",
	email: "johndoe@example.com",
	password: require("crypto").randomBytes(5).toString("hex"),
	token: require("crypto").randomBytes(30).toString("hex"),
};

const rules = {
	username: "required|max:40",
	email: "required|email",
	password: Password.create().min(4).numbers().letters().mixedCase().symbols(),
	token: "required_without_all"
};

const validator = make(fields, rules);

module.exports = validator;