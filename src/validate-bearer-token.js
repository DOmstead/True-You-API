const { API_TOKEN } = require('./config');
const logger = require('./logger');


//This function is a crucial step in this apps security. It ensures that only a program
//with a valid key can make requests to this API. 
function validateBearerToken(req, res, next) {
  const authToken = req.get('Authorization');
  console.log('Req.exports is = ' + req.exports);
  console.log('Req.get is = ' + req.get);
  console.log('Req.exports is = ' + req.authToken);
  
  if (!authToken || authToken.split(' ')[1] !== API_TOKEN) {
    logger.error(`Unauthorized request to path: ${req.path} with authToken *${authToken}*: Should be bearer *${API_TOKEN}* `);
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next();
}

module.exports = validateBearerToken;
