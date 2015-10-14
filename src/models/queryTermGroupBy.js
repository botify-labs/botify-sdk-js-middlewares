class QueryTermGroupBy {
  /**
   * @param  {String} field
   * @param  {Array?}  terms
   * @return {QueryTermGroupBy Class}
   */
    constructor(field, terms = []) {
      this.field = field;
      if (!Array.isArray(terms)) {
        throw new Error('terms must be an Array');
      }
      this.terms = terms;
    }

    toJsonAPI() {
      return this.field;
    }
}

export default QueryTermGroupBy;
