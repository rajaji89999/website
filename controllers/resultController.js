const catchAsync = require('../utils/catchAsync');
const Location = require('../models/locationModel');
const Result = require('../models/resultModel');
const mongoose = require('mongoose');
const moment = require('moment-timezone');

const groupResultsByLocation = async (
  results = [],
  isTodayResult = true,
  isCurrentMonth = false
) => {
  const allLocations = await Location.find({});
  const groupedData = {};

  // Initialize groupedData with all locations
  allLocations.forEach((location) => {
    const { _id, name, sequenceNumber, timeLabel } = location;
    groupedData[name] = {
      _id: _id,
      location: name,
      sequenceNumber: sequenceNumber,
      timeLabel: timeLabel,
    };

    if (isTodayResult) {
      groupedData[name].results = [
        {
          result: '-',
          resultDate: moment().tz("Asia/Kolkata").subtract(1, 'day').format('DD-MM-YYYY'),
        },
        {
          result: 'Wait',
          resultDate: moment().tz("Asia/Kolkata").format('DD-MM-YYYY'),
        },
      ];
    } else {
      // Generate results for the entire month
      const currentDate = moment().tz("Asia/Kolkata");
      const monthStart = currentDate.startOf('month');
      const daysInMonth = isCurrentMonth
        ? new Date().getDate()
        : currentDate.daysInMonth();

      const resultsForMonth = [];
      for (let i = 0; i < daysInMonth; i++) {
        const currentDateForMonth = isCurrentMonth
          ? monthStart.clone().add(i, 'days')
          : monthStart.clone().subtract(1, 'month').add(i, 'days');
        resultsForMonth.push({
          result: '-',
          resultDate: currentDateForMonth.format('DD-MM-YYYY'),
        });
      }

      groupedData[name].results = resultsForMonth;
    }
  });

  results.forEach((item, i) => {
    const { locationId, result, resultDate } = item;
    if (locationId) {
      const locationName = locationId?.name;
      const resultDateFormatted = moment(new Date(resultDate)).format(
        'DD-MM-YYYY'
      );

      if (isTodayResult) {
        const todayDate = moment().tz("Asia/Kolkata").format('DD-MM-YYYY');
        const yesterdayDate = moment().tz("Asia/Kolkata").subtract(1, 'day').format('DD-MM-YYYY');

        const yesterdayResult = results.find(
          (entry) =>
            moment(new Date(entry.resultDate)).format('DD-MM-YYYY') ===
              yesterdayDate && locationName === entry.locationId.name
        );

        const todayResult = results.find(
          (entry) =>
            moment(new Date(entry.resultDate)).format('DD-MM-YYYY') ===
              todayDate && locationName === entry.locationId.name
        );

        groupedData[locationName].results = [
          {
            result: yesterdayResult?.result ? yesterdayResult.result : '-',
            resultDate: yesterdayDate,
          },
          {
            result: todayResult?.result ? todayResult.result : 'Wait',
            resultDate: todayDate,
          },
        ];
      } else {
        const resultEntry = groupedData[locationName].results.find(
          (entry) => entry.resultDate === resultDateFormatted
        );
        if (resultEntry) {
          resultEntry.result = result;
        }
      }
    }
  });

  return Object.values(groupedData).sort(
    (a, b) => a.sequenceNumber - b.sequenceNumber
  );
};

exports.addResult = catchAsync(async (req, res, next) => {
  const result = req.body;

  const newResult = await Result.create(result);

  res.status(200).json({
    message: 'Result added successfully!',
    data: newResult,
  });
});

exports.updateResult = catchAsync(async (req, res, next) => {
  const result = req.body;

  await Result.updateOne(
    {
      locationId: mongoose.Types.ObjectId(result.locationId),
      resultDate: new Date(result.resultDate),
    },
    { $set: result },
    {
      upsert: true,
    }
  );

  res.status(200).json({
    status: 'success',
    message: 'Result updated successfully!',
  });
});

exports.getRecentResultFunc = async () => {
  const results = await Result.find({
    resultDate: moment().tz("Asia/Kolkata").format('YYYY-MM-DD'),
  })
    .populate('locationId')
    .sort({
      updatedAt: -1,
    });

  let recentTimeLabel = null;
  let dataToSend = [];
  if (results && results?.length) {
    dataToSend = results
      .map((result, index) => {
        if (index === 0) {
          recentTimeLabel = result?.locationId?.timeLabel;
        }
        if (result?.result != '-') {
          return {
            name: result?.locationId?.name,
            timeLabel: result?.locationId?.timeLabel,
            result: result?.result,
          };
        }
      })
      .filter((el) => el?.result != '-' && el?.timeLabel === recentTimeLabel);
  }

  return {
    message: 'Recent Result Success!',
    data: dataToSend || [],
  };
};

exports.getRecentResult = catchAsync(async (req, res, next) => {
  res.status(200).json(await this.getRecentResultFunc());
});

exports.getTodayResultFunc = async () => {
  const yesterdayDate = moment().tz("Asia/Kolkata").subtract(1, 'day').format('YYYY-MM-DD');
  const todayDate = moment().tz("Asia/Kolkata").format('YYYY-MM-DD');

  const results = await Result.find({
    $and: [
      { resultDate: { $lte: todayDate } },
      { resultDate: { $gte: yesterdayDate } },
    ],
  })
    .populate('locationId')
    .sort({
      createdAt: 1,
    });

  // console.log({results})

  const resultsToSend = await groupResultsByLocation(results, true);

  return {
    message: 'Today Result Success!',
    results: resultsToSend?.length || 0,
    data: resultsToSend,
  };
};

exports.getTodayResult = catchAsync(async (req, res, next) => {
  res.status(200).json(await this.getTodayResultFunc());
});

exports.getCurrentMonthResultFunc = async () => {
  const momentMonthStartDate = moment().tz("Asia/Kolkata").clone().startOf('month');
  const monthStartDate = momentMonthStartDate.format('YYYY-MM-DD');
  const todayDate = moment().tz("Asia/Kolkata").format('YYYY-MM-DD');

  const results = await Result.find({
    $and: [
      { resultDate: { $lte: todayDate } },
      { resultDate: { $gte: monthStartDate } },
    ],
  })
    .populate('locationId')
    .sort({
      createdAt: 1,
    });

  const resultsToSend = await groupResultsByLocation(results, false, true);

  return {
    message: 'Current Month Result Success!',
    monthName: momentMonthStartDate.format('MMMM'),
    results: resultsToSend?.length || 0,
    data: resultsToSend,
  };
};

exports.getCurrentMonthResult = catchAsync(async (req, res, next) => {
  res.status(200).json(await this.getCurrentMonthResultFunc());
});

exports.getPreviousMonthResultFunc = async () => {
  const momentPrevMonthStartDate = moment().tz("Asia/Kolkata")
    .clone()
    .subtract(1, 'month')
    .startOf('month');
  const prevMonthStartDate = momentPrevMonthStartDate.format('YYYY-MM-DD');
  const prevMonthEndDate = momentPrevMonthStartDate
    .clone()
    .endOf('month')
    .format('YYYY-MM-DD');

  const results = await Result.find({
    $and: [
      { resultDate: { $lte: prevMonthEndDate } },
      { resultDate: { $gte: prevMonthStartDate } },
    ],
  })
    .populate('locationId')
    .sort({
      createdAt: 1,
    });

  const resultsToSend = await groupResultsByLocation(results, false, false);

  return {
    message: 'Previous Month Result Success!',
    monthName: momentPrevMonthStartDate.format('MMMM'),
    results: resultsToSend?.length || 0,
    data: resultsToSend,
  };
};

exports.getPreviousMonthResult = catchAsync(async (req, res, next) => {
  res.status(200).json(await this.getPreviousMonthResultFunc());
});

exports.addBlankEntries = catchAsync(async (req, res, next) => {
  const locations = await Location.find({}).sort({ createdAt: 1 });

  for (let index = 0; index < locations.length; index++) {
    const result = {
      locationId: locations[index]._id,
      resultDate: new Date(moment(new Date()).format('YYYY-MM-DD')),
    };
    await Result.create(result);
  }

  res.status(200).json({
    message: 'Add Blank Entries',
  });
});
