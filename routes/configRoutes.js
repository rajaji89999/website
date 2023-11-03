const express = require('express');
const {
  getConfigs,
  updateConfigs,
} = require('./../controllers/configController');

const router = express.Router();

router.get('/', getConfigs);
router.patch('/update', updateConfigs);

module.exports = router;
