'use strict';

const AVAILABLE_STATUSES = ['PENDING', 'SUCCESSFUL', 'REJECTED'];

module.exports = (() => {
  return {
    PENDING: AVAILABLE_STATUSES[0],
    SUCCESSFUL: AVAILABLE_STATUSES[1],
    REJECTED: AVAILABLE_STATUSES[2]
  };
})();
//# sourceMappingURL=statuses.helper.js.map