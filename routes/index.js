const express = require('express');
const router = express.Router();
const userRouter = require('./userRoutes');
const locationRouter = require('./locationRoutes');
const resultRouter = require('./resultRoutes');

router.use('/auth', userRouter);
router.use('/location', locationRouter);
router.use('/result', resultRouter);

module.exports = router;
