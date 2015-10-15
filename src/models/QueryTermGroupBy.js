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

  processKeyResponse(keyItem, {transformKeys = true, injectMetadata = true, normalizeBoolean = true}) {
    let key = keyItem;

    if (transformKeys) {
      key = this._transformTermKeys(key);
    }
    if (injectMetadata && transformKeys) {
      key = this._injectMetadata(key);
    }
    if (normalizeBoolean) {
      key = this._normalizeBoolean(key);
    }

    return key;
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


  _normalizeBoolean(key) {
    return key === 'T' ? true
         : key === 'F' ? false
         : key;
  }
}

export default QueryTermGroupBy;
