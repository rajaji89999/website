const mongoose = require('mongoose');
const dotenv = require('dotenv');
const moment = require("moment");

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT REJECTION 😑. Shutting down...');
  // console.log(`${err.name}: ${err.message}`);
  console.log(`${err.stack}`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT || 5000;

const DB = process.env.DATABASE?.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const LocalDB = process.env.DATABASE_LOCAL;

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then((res) => {
    console.log(`App connected with ${res.connection.name} database`);
    console.log("Moment Locale: ", moment.locale())
    console.log("Default Date: ", moment().format("YYYY-MM-DD"))
    console.log("India Date: ", moment().tz("Asia/Kolkata").format("YYYY-MM-DD"))
  });

const server = app.listen(port, () => {
  console.log(
    `App running in ${app.get('env')} mode on ${`http://127.0.0.1:${port}`}`
  );
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION 😑. Shutting down...');
  console.log(`${err.name}: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
