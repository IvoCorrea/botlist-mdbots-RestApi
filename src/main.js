const compression = require('compression');
const Handler = require('./core/Handler');
const express = require('express');
const Log = require('./core/Log');
const cors = require('cors');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.disable('x-powered-by');
app.use(express.json());
app.use(compression());
app.use(cors());

const handler = new Handler(app, {
  controllers: 'src/app/controllers',
});

async function startServer() {
  await handler.init();

  if (require.main === module)
    app.listen(9098, () => {
      Log.info(`API Online: http://localhost:9098`);
    });
}

startServer();
module.exports = app;
