import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/auth/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');

      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (err) {
    console.error(err);
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/auth/logout',
    });

    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    console.error(err);
    showAlert('error', 'Error logging out! Try again.');
  }
};

export const getLocation = async (locationId, shouldAlert = false) => {
  try {
    const res = await axios({
      method: 'GET',
      url: `/api/location/${locationId}`,
    });

    if (res.data.status === 'success') {
      if (shouldAlert) {
        showAlert('success', res.data.message);
      }
      return res?.data?.data;
    }
  } catch (err) {
    console.error(err);
    s;
    if (shouldAlert) {
      showAlert('error', err.response.data.message);
    }
  }
};

export const addLocation = async (locationName, timeLabel) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/location/add',
      data: {
        name: locationName,
        timeLabel,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);

      window.setTimeout(() => {
        location.reload();
      }, 200);
    }
  } catch (err) {
    console.error(err);
    showAlert('error', err.response.data.message);
  }
};

export const updateLocation = async (locationId, locationData = {}) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/location/update/${locationId}`,
      data: locationData,
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);

      window.setTimeout(() => {
        location.reload();
      }, 200);
    }
  } catch (err) {
    console.error(err);
    showAlert('error', err.response.data.message);
  }
};

export const deleteLocation = async (locationId) => {
  try {
    const res = await axios({
      method: 'DELETE',
      url: `/api/location/delete/${locationId}`,
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);

      window.setTimeout(() => {
        location.reload();
      }, 200);
    }
  } catch (err) {
    console.error(err);
    showAlert('error', err.response.data.message);
  }
};

export const updateResult = async (locationId, resultDate, result) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `/api/result/update`,
      data: {
        locationId,
        resultDate,
        result,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', res.data.message);

      window.setTimeout(() => {
        location.reload();
      }, 500);
    }
  } catch (err) {
    console.error(err);
    showAlert('error', err.response.data.message);
  }
};
