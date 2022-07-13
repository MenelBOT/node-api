class programmingLanguage {
/**
 *
 * @param {number} id The database ID of the language
 * @param {string} name The name of the language
 * @param {number} released_year The year in which the language was released
 * @param {number} githut_rank The language's rank on githut ranking
 * @param {number} pypl_rank The language's rank on pypl ranking
 * @param {number} tiobe_rank The language's rank on tiobe ranking
 */
	constructor(id, name, released_year, githut_rank, pypl_rank, tiobe_rank) {
		if (typeof id == "object") {

			this.id = id.id;
			this.name = id.name;
			this.released_year = id.released_year;
			this.githut_rank = id.githut_rank;
			this.pypl_rank = id.pypl_rank;
			this.tiobe_rank = id.tiobe_rank;

		} else {

			this.id = id;
			this.name = name;
			this.released_year = released_year;
			this.githut_rank = githut_rank;
			this.pypl_rank = pypl_rank;
			this.tiobe_rank = tiobe_rank;

		}

		if ([this.id, this.name, this.released_year, this.githut_rank, this.pypl_rank, this.tiobe_rank].some(value => value == undefined)) throw new TypeError("Cannot set property to undefined!\n(error in constructor of programmingLanguage)");

	}

	/**
	 * This function tests whether a given object can be used to create an instance of the programmingLanguage class
	 * @param {object} languageToValidate the object to test
	 * @returns The instantialized object if it successfully creates, undefined otherwise
	 */
	static validate(languageToValidate) {
		try {
			const test = new programmingLanguage(languageToValidate);
			return test;
		} catch (error) {
			return undefined;
		}
	}
}

module.exports = programmingLanguage;