const { make, Password } = require("simple-body-validator");

// This only as default
const fields = {
	username: "JohnDoe",
	email: "johndoe@example.com",
	password: require("crypto").randomBytes(5).toString("hex"),
};

const rules = {
	username: "required_without:email",
	email: "required_without:username|email",
	password: Password.create().min(4).numbers().letters().mixedCase().symbols(),
};

const validator = make(fields, rules);

module.exports = validator;