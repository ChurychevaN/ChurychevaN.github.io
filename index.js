"use strict";

const CONSTANTS = {
  WEEK: "week",
  MONTH: "month",
  DAYS: "days",
  HOURS: "hours",
  MINUTES: "minutes",
  SECONDS: "seconds",
  WEEKDAYS: "weekdays",
  WEEKENDS: "weekends",
  RESULTS: "results",
};

const startDateElement = document.querySelector(".start-date");
const endDateElement = document.querySelector(".end-date");
const presetInterval = document.querySelector(".preset-interval");
const workdaysOption = document.querySelector(".workdays-options");
const calculationOption = document.querySelector(".time-options");
const calculateBtn = document.querySelector(".calculate-batton");
const resultElement = document.querySelector(".result-str");
const resultsTable = document.querySelector(".result-table");
const resultsTableBody = document.querySelector(".results-table-body");

const getSeconds = (days) => days * 24 * 60 * 60;
const getMinutes = (days) => days * 24 * 60;
const getHours = (days) => days * 24;
const getDays = (interval) => interval / (1000 * 60 * 60 * 24);
const getWeek = (date) => new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
const getMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, date.getDate());

const endDateChange = () => {
  startDateElement.max = endDateElement.value;
  changeBtn();
};

const changeBtn = () => {
  if(startDateElement.value && endDateElement.value && workdaysOption.value) {
    calculateBtn.disabled = false;
  }
};

// Function for saving the result in localStorage
const saveResults = (startDate, endDate, result) => {
  const resultsArray = JSON.parse(localStorage.getItem(CONSTANTS.RESULTS)) ?? [];
  const resultsArraylenght = resultsArray.length;

  resultsArray.push({ startDate, endDate, result });

  if (resultsArraylenght > 10) {
    resultsArray.splice(0, resultsArraylenght - 10);
  }

  localStorage.setItem(CONSTANTS.RESULTS, JSON.stringify(resultsArray));
};

// Function for displaying results in a table
const displayResults = () => {
  const savedResults = JSON.parse(localStorage.getItem(CONSTANTS.RESULTS)) ?? [];

  resultsTableBody.innerHTML = "";

  savedResults.forEach((result) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${result.startDate}</td>
      <td>${result.endDate}</td>
      <td>${Math.round(result.result)}</td>
    `;
    resultsTableBody.appendChild(row);
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

startDateElement.addEventListener("input", () => {
  endDateElement.min = startDateElement.value;
  endDateElement.disabled = false;
  changeBtn();
});

presetInterval.addEventListener("change", () => {
  const startDate = new Date(startDateElement.value);
  const selectedPreset = presetInterval.value;

  let endDate;
  switch (selectedPreset) {
    case CONSTANTS.WEEK:
      endDate = getWeek(startDate);
      break;
    case CONSTANTS.MONTH:
      endDate = getMonth(startDate);
      break;
    default:
      break;
  }

  endDateElement.value = endDate ? endDate.toISOString().split("T")[0] : "";
  endDateChange();
});

function calculateTimeInterval() {
  const startInput = new Date(startDateElement.value);
  const endInput = new Date(endDateElement.value);

  let timeInterval = endInput.getTime() - startInput.getTime();
  let days = 0;
  let result = 0;

  switch (workdaysOption.value) {
    case CONSTANTS.WEEKDAYS:
      days = getDays(timeInterval);
      break;
    case CONSTANTS.WEEKENDS:
      days = getWeekends(startInput, endInput);
      break;
    default:
      break;
  }

  switch (calculationOption.value) {
    case CONSTANTS.DAYS:
      result = days;
      break;
    case CONSTANTS.HOURS:
      result = getHours(days);
      break;
    case CONSTANTS.MINUTES:
      result = getMinutes(days);
      break;
    case CONSTANTS.SECONDS:
      result = getSeconds(days);
      break;
    default:
      result = days;
      break;
  }

  resultElement.textContent = `Time difference ${Math.round(result)}`;

  // Saving the result
  const startDateString = startDateElement.value;
  const endDateString = endDateElement.value;
  saveResults(startDateString, endDateString, result);

  // Update the results table
  displayResults();
}

function getWeekends(startInput, endInput) {
  let weekends = 0;
  let currentDate = new Date(startInput);

  while (currentDate <= endInput) {
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      weekends++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return weekends;
}

endDateElement.addEventListener("change", endDateChange);
workdaysOption.addEventListener("change", changeBtn);
calculateBtn.addEventListener("click", calculateTimeInterval);

window.addEventListener("load", displayResults);
