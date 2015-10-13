class QueryTermGroupBy {
  /**
   * [constructor description]
   * @param  {String} field [description]
   * @param  {Array}  terms [description]
   * @return {QueryTermGroupBy Class}       [description]
   */
    constructor(field, terms = []) {
      this.field = field;
      this.terms = terms;
    }

    toJsonAPI() {
      return {
        term: {
          field: this.field,
          terms: this.terms,
        },
      };
    }
}

export default QueryTermGroupBy;
