'use strict';

const _ = require('lodash');
const dotenv = require('dotenv');
const current_env = process.env.NODE_ENV || 'development';

dotenv.config({ path: `./envs/.env.${current_env}` });

// Export the config object based on the NODE_ENV
// ==============================================
if(process.env.NODE_ENV == "test"){
    module.exports = require('./shared');
} else {
    module.exports = _.merge(
        require('./shared'),
        require('./' + current_env + '.js') || {});
}