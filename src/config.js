'use strict';

function commitId() {
  return process.env.RENDER_GIT_COMMIT || process.env.GIT_SHA || 'local';
}

module.exports = { commitId };
