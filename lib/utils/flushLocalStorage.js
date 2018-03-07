'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = flushLocalStorageIfDataModelVersionChanged;
var LSCACHE_DATA_MODEL_VERSION_ID = 'botifySdk-lscache-datamodel-version';
exports.LSCACHE_DATA_MODEL_VERSION_ID = LSCACHE_DATA_MODEL_VERSION_ID;
var EXPIRATION_SEC = 60 * 24 * 365;

function flushLocalStorageIfDataModelVersionChanged(version) {
  var cachedDataModelVersion = localStorage.getItem(LSCACHE_DATA_MODEL_VERSION_ID);

  if (cachedDataModelVersion !== version) {
    localStorage.clear();
    localStorage.setItem(LSCACHE_DATA_MODEL_VERSION_ID, version, EXPIRATION_SEC);
  }
}