const { NODE_ENV } = require('./config');
const logger = require('./logger');


//This error handler sends a response if an error occurs on our server. This
//helps us know if we need to make changes, or if requests are being made incorrectly. 
function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    logger.error(error.message);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
}

module.exports = errorHandler;
