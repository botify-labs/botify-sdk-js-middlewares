class QueryTermGroupBy {
  /**
   * [constructor]
   * @param  {String} field
   * @param  {Array}  terms
   * @return {QueryTermGroupBy Class}
   */
    constructor(field, terms = []) {
      this.field = field;
      this.terms = terms;
    }

    toJsonAPI() {
      return this.field;
    }
}

export default QueryTermGroupBy;
