import path from 'path';


export const ABSOLUTE_BASE = path.normalize(path.join(__dirname, '..'));
export const NODE_MODULES_DIR = path.join(ABSOLUTE_BASE, 'node_modules'),
export const KARMA_CONFIG_PATH = path.join(ABSOLUTE_BASE, 'karma.conf.js'),
export const BUILD_DIR = path.join(ABSOLUTE_BASE, 'build'),
export const SRC_DIR = path.join(ABSOLUTE_BASE, 'src'),
