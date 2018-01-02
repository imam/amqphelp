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
      return `${root_path}/helper`;
    },
    // to_api: () => {
    //   return `${root_path}/app/api`;
    // },
    // to_api_v1: () => {
    //   return `${root_path}/app/api/v1`;
    // },
    // to_api_util: () => {
    //   return `${root_path}/app/api/util.js`;
    // },
    // to_messaging: () => {
    //   return `${root_path}/app/messaging`;
    // },
    // to_messaging_helper: () => {
    //   return `${root_path}/app/messaging/helper`;
    // },
    // to_messaging_model: () => {
    //   return `${root_path}/app/messaging/model`;
    // },
    // to_messaging_activity: () => {
    //   return `${root_path}/app/messaging/activity`;
    // },
    // to_public: () => {
    //   return `${root_path}/public`;
    // },
    // to_tests: () => {
    //   return `${root_path}/tests`;
    // },
    // to_factories: () => {
    //   return `${root_path}/tests/factories`;
    // },
    // to_fixtures: () => {
    //   return `${root_path}/tests/fixtures`;
    // },
    // to_configs: () => {
    //   return `${root_path}/app/configs`;
    // },
    // to_env: () => {
    //   return `${root_path}/app/configs/environment`;
    // },
    // to_knox: () => {
    //   return `${root_path}/app/configs/knox`;
    // },
    // to_axios: () => {
    //   return `${root_path}/app/configs/axios`;
    // }
  };
})();
