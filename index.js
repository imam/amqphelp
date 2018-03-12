'use strict';

const pathfinder = require('./pathfinder');
const path_to_default_setttings = `${pathfinder.to_configs()}/default_settings.json`;
const result = require('dotenv').config();
const env = require('./app/configs/environment');
const _ = require('lodash')

let default_settings = require(`${path_to_default_setttings}`);

//Default settings parser
if(result.parsed){
	let convert = {
		WEB_BROKER_NAME: "name",
		WEB_BROKER_COOKIE: "cookie",
		WEB_BROKER_DEFAULT_USER: "user",
		WEB_BROKER_DEFAULT_PASS: "pass",
		WEB_BROKER_DEFAULT_VHOST: "vhost"
	}

	let convert_result = {};

	_.each(convert, (value, key)=>{
		convert_result[value] = result.parsed[key]
	})

	default_settings.connection.options = _.merge(default_settings.connection.options, convert_result)
}

module.exports = (overwrite_settings=null) => {
	let amqphelp_client;
	// if no specified settings use default settings
	if(overwrite_settings){
		amqphelp_client = require(`${pathfinder.to_app()}`)(overwrite_settings);
	} else if(process.env.npm_package_name === "amqphelp" && process.env.NODE_ENV == "development" && env){
    amqphelp_client = require(`${pathfinder.to_app()}`)(env.amqphelp)
	}else {
    amqphelp_client = require(`${pathfinder.to_app()}`)(default_settings)
	}
  return amqphelp_client;
}
