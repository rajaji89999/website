const mongoose = require('mongoose');

const configSchema = new mongoose.Schema(
  {
    isChartEnabled: {
      type: Boolean,
      default: false,
    },
    chartDetails: {
      type: Object,
      default: {},
    },
  },
  {
    versionKey: false,
  }
);

configSchema.index({ locationId: 1, resultDate: 1 }, { unique: true });

const Config = mongoose.model('config', configSchema);

module.exports = Config;
