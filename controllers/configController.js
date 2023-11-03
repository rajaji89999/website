const catchAsync = require('../utils/catchAsync');
const Config = require('../models/configModel');

exports.getConfigsFunc = async () => {
  const configs = await Config.findOne({});
  return {
    message: 'Get Configs Success!',
    data: configs,
  };
};

exports.getConfigs = catchAsync(async (req, res, next) => {
  res.status(200).json(await this.getConfigsFunc());
});

exports.updateConfigsFunc = async (updatedData) => {
  const defaultData = {
    isChartEnabled: false,
    chartDetails: {
      header: '',
      footer: '',
      whatsappNo: '',
    },
  };

  await Config.updateOne({}, updatedData ?? defaultData, {
    upsert: true,
  });

  return {
    status: 'success',
    message: 'Configs updated successfully!',
  };
};

exports.updateConfigs = catchAsync(async (req, res, next) => {
  res.status(200).json(await this.updateConfigsFunc(req.body));
});
