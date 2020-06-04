const logger = require('../logger');

//No Errors is set by default so that the value can later be changed if an error occurs, and can be handled
//or shown to the user as needed.
const NO_ERRORS = null;

//This function ensures that requests received contain all the needed data to create a new record or update an existing
//one, and sends clear easy to follow instructions for the user on what to do if something is missing or incorrect.
function getNameRecordValidationError({ name, gender, era }) {
  if (name &&
    (name.length < 2 || name.length > 20)) {
    logger.error(`Supplied Name '${name}' is less than 2 or longer than 20 characters`);
    return {
      error: {
        message: `Supplied Name '${name}' is less than 2 or longer than 20 characters`
      }
    };
  }

  if (gender &&
    (gender !== 'M' && gender !== 'F' && gender !== 'B')) {
    logger.error(`Gender supplied is ${gender}. Should be M for Male, F for Female, or B for Both`);
    return {
      error: {
        message: `Please supply gender as M for Male, F for Female, or B for Both. You supplied ${gender}`
      }
    };
  }

  if (gender &&
    (era !== 'Modern' && era !== 'Classic')) {
    logger.error(`Era supplied is ${era}. Should be Modern or Classic,`);
    return {
      error: {
        message: `Please supply era as Modern or Classic. You supplied ${era}`
      }
    };
  }

  return NO_ERRORS;
}

module.exports = {
  getNameRecordValidationError,
};
