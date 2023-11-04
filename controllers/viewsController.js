const Location = require('../models/locationModel');
const catchAsync = require('../utils/catchAsync');
const { getConfigsFunc } = require('./configController');
const {
  getRecentResultFunc,
  getTodayResultFunc,
  getCurrentMonthResultFunc,
  getPreviousMonthResultFunc,
} = require('./resultController');
const moment = require('moment');

const sortDataByTime = (data = []) => {
  return (
    data
      .map((location) => {
        const [time, period] = location.timeLabel.trim().split(' ');
        const [hours, minutes] = time.split(':');

        // Convert to 24-hour format
        let hourValue = parseInt(hours, 10);
        if (period === 'PM' && hourValue < 12) {
          hourValue += 12;
        } else if (period === 'AM' && hourValue === 12) {
          hourValue = 0;
        }

        // Convert to a sortable numeric value (e.g., 11:20 PM becomes 23.333)
        const numericValue = hourValue + parseFloat(minutes) / 60;

        return { ...location, numericValue };
      })
      // Step 4: Sort the data based on the numeric value
      .sort((a, b) => a.numericValue - b.numericValue)
      .map((item) => {
        delete item.numericValue;
        if(item.location.includes("DISAWAR")) {
          item.sequenceNumber = 1;
        } else{
          item.sequenceNumber = 0;
        }
        return item;
      })
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map((item) => {
        delete item.sequenceNumber;
        return item;
      })
  );
};

const todayDataFormattor = (monthData = {}) => {
  return {
    data: sortDataByTime(monthData.data) || [],
  };
};

const monthDataFormattor = (monthData = {}) => {
  return {
    name: monthData.monthName,
    data: sortDataByTime(monthData.data) || [],
    dateArray:
      (monthData?.data &&
        monthData?.data[0]?.results?.map((el) => el.resultDate)) ||
      [],
    todayDate: moment(new Date()).format('DD-MM-YYYY'),
  };
};

exports.getHome = catchAsync(async (req, res, next) => {
  const recentData = { ...(await getRecentResultFunc()) };
  const todayData = { ...(await getTodayResultFunc()) };
  const currentMonthData = { ...(await getCurrentMonthResultFunc()) };
  const prevMonthData = { ...(await getPreviousMonthResultFunc()) };
  const configs = { ...(await getConfigsFunc()) };

  res.status(200).render('home', {
    title: 'B1Satta | Home',
    recentData: recentData.data,
    todayData: todayDataFormattor(todayData),
    currentMonth: monthDataFormattor(currentMonthData),
    prevMonth: monthDataFormattor(prevMonthData),
    isChartEnabled: configs?.data?.isChartEnabled ?? false,
    chartDetails: configs?.data?.chartDetails ?? {},
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'B1Satta | Login',
  });
});

exports.getAddLocation = catchAsync(async (req, res, next) => {
  res.status(200).render('add-location', {
    title: 'Admin | Add Location',
  });
});
exports.getUpdateLocation = catchAsync(async (req, res, next) => {
  const locations = await Location.find({}).sort({ sequenceNumber: 1 });

  res.status(200).render('update-location', {
    title: 'Admin | Update Location',
    locations,
  });
});
exports.getDeleteLocation = catchAsync(async (req, res, next) => {
  const locations = await Location.find({}).sort({ sequenceNumber: 1 });

  res.status(200).render('delete-location', {
    title: 'Admin | Delete Location',
    locations,
  });
});
exports.getUpdateResult = catchAsync(async (req, res, next) => {
  const locations = await Location.find({}).sort({ sequenceNumber: 1 });

  res.status(200).render('update-result', {
    title: 'Admin | Update Result',
    locations,
  });
});
exports.getChartSettings = catchAsync(async (req, res, next) => {
  const configs = { ...(await getConfigsFunc()) };
  const isChartEnabled = configs?.data?.isChartEnabled ?? false;
  const chartDetails = configs?.data?.chartDetails ?? {};

  console.log(isChartEnabled, chartDetails);
  res.status(200).render('chart-settings', {
    title: 'Admin | Chart Settings',
    isChartEnabled,
    chartDetails,
  });
});
