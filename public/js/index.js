import '@babel/polyfill';
import {
  login,
  logout,
  addLocation,
  getLocation,
  updateLocation,
  deleteLocation,
  updateResult,
} from './apis';

// DOM ELEMENTS
const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.logout-btn');
const addLocationForm = document.querySelector('#addLocationForm');
const updateLocationFormLocationSelectEl = document.querySelector(
  '#updateLocationForm-selectLocation'
);
const updateLocationForm = document.querySelector('#updateLocationForm');
const deleteLocationForm = document.querySelector('#deleteLocationForm');
const updateResultForm = document.querySelector('#updateResultForm');

// Authentication
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

// Location
console.log(addLocationForm);
if (addLocationForm) {
  addLocationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const locationName = document.querySelector(
      '#addLocationForm-locationName'
    ).value;
    const timeLabel = document.querySelector('#addLocationForm-timeLabel').value;
    await addLocation(locationName, timeLabel);
  });
}

if (updateLocationFormLocationSelectEl) {
  updateLocationFormLocationSelectEl.addEventListener('change', async (e) => {
    const locationId = updateLocationFormLocationSelectEl.value;

    const location = await getLocation(locationId);

    const locationNameEl = document.querySelector(
      '#updateLocationForm-locationName'
    );
    const timeLabelEl = document.querySelector('#updateLocationForm-timeLabel');
    if (location) {
      locationNameEl.value = location?.name;
      timeLabelEl.value = location?.timeLabel;
    }
  });
}

if (updateLocationForm) {
  updateLocationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const locationId = updateLocationFormLocationSelectEl.value;
    const locationName = document.querySelector(
      '#updateLocationForm-locationName'
    ).value;
    const timeLabel = document.querySelector(
      '#updateLocationForm-timeLabel'
    ).value;

    const dataToUpdate = {
      name: locationName,
      timeLabel,
    };

    await updateLocation(locationId, dataToUpdate);
  });
}

if (deleteLocationForm) {
  deleteLocationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const locationId = document.querySelector(
      '#deleteLocationForm-selectLocation'
    ).value;
    await deleteLocation(locationId);
  });
}

if (updateResultForm) {
  updateResultForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const selectLocationEl = document.querySelector(
      '#updateResultForm-selectLocation'
    );
    const locationId = selectLocationEl?.value;

    const resultDateEl = document.querySelector('#updateResultForm-resultDate');
    const resultDate = resultDateEl?.value;

    const resultEl = document.querySelector('#updateResultForm-result');
    const result = resultEl?.value;

    await updateResult(locationId, resultDate, result);
  });
}
