const express = require('express');
const path = require('path');
const morgan = require('morgan');
const app = express();
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Routers
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const appRouter = require('./routes');
const viewRouter = require('./routes/viewRoutes');

// Global Middlewares
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes(Middlewares)
app.use('/', viewRouter);
app.use('/api', appRouter);
app.use('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
