'use strict';

const path = require('path');
const _ = require('lodash');

module.exports = (() => {
  let root_path = process.env.PWD;
  return {
    to_root: () => {
      return root_path;
    },
    to_app: () => {
      return `${root_path}/helpers`;
    },
    to_configs: () => {
      return `${root_path}/configs`;
    },
    to_tests: () => {
      return `${root_path}/tests`;
    }
  };
})();
