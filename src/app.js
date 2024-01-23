require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const validateBearerToken = require('./validate-bearer-token');
const errorHandler = require('./error-handler');
const nameRecordsRouter = require('./namerecords/namerecords-router');


//Welcome to the core of this API! While there may not be a lot of long functions in this file
//don't let that fool you! This is one of the most important pieces of the program. 
//We use morgan for logging, helmet for security through obfuscation, our own validator function
//to prevent rogue requests, and then call our router and error handler.

const app = express();

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
  skip: () => NODE_ENV === 'test'
}));

app.use(cors());
app.use(helmet());
app.use(validateBearerToken);
app.use(nameRecordsRouter);
app.use(errorHandler);

module.exports = app;
