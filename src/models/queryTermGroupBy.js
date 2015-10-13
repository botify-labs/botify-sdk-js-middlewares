class QueryTermGroupBy {
    constructor(field, terms = []) {
      this.field = field;
      this.terms = terms;
    }

    toJSON() {

    }
}

export default QueryTermGroupBy;
