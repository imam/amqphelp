'use strict';

var _statuses = require('./statuses.helper');

var _statuses2 = _interopRequireDefault(_statuses);

var _channel = require('./channel.helper');

var _action = require('./action.helper');

var _util = require('./util.helper');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = settings => {

  let utils = new _util.MessagingUtil();
  let messagingChannel = new _channel.MessagingChannel({ utils });

  return {
    utils,
    statuses: _statuses2.default,
    actions: new _action.MessagingAction({ settings, utils, MessagingChannel: messagingChannel })
  };
};
//# sourceMappingURL=index.js.map