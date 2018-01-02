'use strict';

const pathfinder = require('./pathfinder');

const configs = require(`${pathfinder.to_configs()}/default.json`);

console.info(configs);
