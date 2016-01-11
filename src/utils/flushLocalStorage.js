
export const LSCACHE_DATA_MODEL_VERSION_ID = 'botifySdk-lscache-datamodel-version';
const EXPIRATION_SEC = 60 * 24 * 365;

export default function flushLocalStorageIfDataModelVersionChanged(version) {
  const cachedDataModelVersion = localStorage.getItem(LSCACHE_DATA_MODEL_VERSION_ID);

  if (cachedDataModelVersion !== version) {
    localStorage.clear();
    localStorage.setItem(LSCACHE_DATA_MODEL_VERSION_ID, version, EXPIRATION_SEC);
  }
}

