const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'location',
    },
    result: {
      type: String,
      default: '-',
    },
    resultDate: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

resultSchema.index({ locationId: 1, resultDate: 1 }, { unique: true });

const Result = mongoose.model('result', resultSchema);

module.exports = Result;
