import find from 'lodash.find';
import isArray from 'lodash.isarray';

const DEFAULT_AGG_SIZE = 300;
const DEFAULT_AGG_ORDER = {
  value: 'asc',
};

class QueryTermGroupBy {
  /**
   * @param  {Object|String} descriptor or field id
   * @return {QueryTermGroupBy Class}
   */
  constructor(descriptor, terms = []) {
    if (!isArray(terms)) {
      throw new Error('terms must be an Array');
    }
    this.terms = terms;

    const isSimpleField = typeof descriptor === 'string';
    if (!isSimpleField && !descriptor.distinct) {
      throw new Error('Invalid field provided. Field must either be a string or a POJO with the \'distinct\' key.');
    }

    // Simple Aggregates use a string to define their groups
    if (isSimpleField) {
      this.field = descriptor;
      this.order = DEFAULT_AGG_ORDER;
      this.size = DEFAULT_AGG_SIZE;
    } else { // Complex Aggregates use an object to define their groups
      this.field = descriptor.distinct.field;
      this.order = descriptor.distinct.order || DEFAULT_AGG_ORDER;
      this.size = descriptor.distinct.size || DEFAULT_AGG_SIZE;
    }
  }

  toJsonAPI() {
    return {
      distinct: {
        field: this.field,
        order: this.order,
        size: this.size,
      },
    };
  }

  applyKeyReducers(keyItem, {transformTermKeys, injectMetadata} = {}) {
    let key = keyItem;

    if (transformTermKeys) {
      key = this._transformTermKeys(key);
    }
    if (injectMetadata && transformTermKeys) {
      key = this._injectMetadata(key);
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
}

export default QueryTermGroupBy;
