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
		this.id = id;
		this.name = name;
		this.released_year = released_year;
		this.githut_rank = githut_rank;
		this.pypl_rank = pypl_rank;
		this.tiobe_rank = tiobe_rank;
	}

	/**
	 * This function tests whether a given object can be used to create an instance of the programmingLanguage class
	 * @param {object} languageToValidate the object to test
	 */
	static validate(languageToValidate) {
		try {
			// eslint-disable-next-line no-unused-vars
			const test = new programmingLanguage(languageToValidate);
			return true;
		} catch (error) {
			return false;
		}
	}
}

module.exports = programmingLanguage;