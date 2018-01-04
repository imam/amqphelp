'use strict';

const path = require('path');
const _ = require('lodash');

module.exports = (() => {
  let root_path = __dirname;
  return {
    to_root: () => {
      return root_path;
    },
    to_app: () => {
      return `${root_path}/dist/helpers`;
    },
    to_configs: () => {
      return `${root_path}/dist/configs`;
    },
    to_tests: () => {
      return `${root_path}/tests`;
    }
  };
})();
