'use strict';

const app = require('./src/app');
const { commitId } = require('./src/config');

const PORT = Number(process.env.PORT) || 3000;

app.createApp().listen(PORT, () => {
  console.log(`Classroom Availability Finder listening on http://localhost:${PORT} (commit: ${commitId()})`);
});
