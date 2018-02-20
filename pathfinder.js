'use strict';

const path = require('path');
const _ = require('lodash');

let env_path = "dist";

if(process.env.NODE_ENV === 'test' && process.env.npm_package_name === 'amqphelp'){
  env_path = "app";
}

//TODO:: Find how to test without using NODE_ENV

module.exports = (() => {
  let root_path = __dirname;
  return {
    to_root: () => {
      return root_path;
    },
    to_app: () => {
      return `${root_path}/${env_path}/helpers`;
    },
    to_configs: () => {
      return `${root_path}/${env_path}/configs`;
    },
    to_tests: () => {
      return `${root_path}/tests`;
    }
  };
})();
