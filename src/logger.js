const winston = require('winston');
const { NODE_ENV } = require('./config');

//This file utilizes winston to create a logger file that we can then write to when errors occur. 
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'info.log' })
  ]
});

if (!['production', 'test'].includes(NODE_ENV)) {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
