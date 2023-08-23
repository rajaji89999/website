const Location = require('../models/locationModel');
const catchAsync = require('../utils/catchAsync');
const {
  getRecentResultFunc,
  getTodayResultFunc,
  getCurrentMonthResultFunc,
  getPreviousMonthResultFunc,
} = require('./resultController');
const moment = require('moment');

const todayDataFormattor = (monthData = {}) => {
  return {
    data: monthData.data || [],
  };
};

const monthDataFormattor = (monthData = {}) => {
  return {
    name: monthData.monthName,
    data: monthData.data || [],
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

  res.status(200).render('home', {
    title: 'Home',
    recentData: {
      name: recentData?.data?.locationId?.name,
      timeLabel: recentData?.data?.locationId?.timeLabel,
      result: recentData?.data?.result,
    },
    todayData: todayDataFormattor(todayData),
    currentMonth: monthDataFormattor(currentMonthData),
    prevMonth: monthDataFormattor(prevMonthData),
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  res.status(200).render('login', {
    title: 'Login',
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
