'use strict';

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _mongodb = require('../../attachers/mongodb.js');

var _mongodb2 = _interopRequireDefault(_mongodb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = settings => {
  const amqp = new _base2.default({ settings });

  amqp.registerAttacher('mongo', new _mongodb2.default());

  return amqp;
};
//# sourceMappingURL=index.js.map