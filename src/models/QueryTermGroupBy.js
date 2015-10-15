import find from 'lodash.find';
import isArray from 'lodash.isarray';


class QueryTermGroupBy {
  /**
   * @param  {String} field
   * @param  {?Array} terms
   * @return {QueryTermGroupBy Class}
   */
  constructor(field, terms = []) {
    this.field = field;
    if (!isArray(terms)) {
      throw new Error('terms must be an Array');
    }
    this.terms = terms;
  }

  toJsonAPI() {
    return this.field;
  }

  applyKeyReducers(keyItem, {transformTermKeys = true, injectMetadata = true, normalizeBoolean = true} = {}) {
    let key = keyItem;

    if (normalizeBoolean) {
      key = this._normalizeBoolean(key);
    }
    if (transformTermKeys) {
      key = this._transformTermKeys(key);
    }
    if (injectMetadata && transformTermKeys) {
      key = this._injectMetadata(key);
    }

    return key;
  }

  _normalizeBoolean(key) {
    return key === 'T' ? true
         : key === 'F' ? false
         : key;
  }

  _transformTermKeys(key) {
    return {
      value: key,
    };
  }

  _injectMetadata(key) {
    const relatedTerm = find(this.terms, term => {
      return term.value === key.value;
    });
    return {
      ...key,
      metadata: relatedTerm && relatedTerm.metadata || {},
    };
  }
}

export default QueryTermGroupBy;
