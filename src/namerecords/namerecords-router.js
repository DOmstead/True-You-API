const path = require('path');
const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const NameRecordsService = require('./namerecords-service');
const { getNameRecordValidationError } = require('./namerecords-validator');

const nameRecordsRouter = express.Router();
const bodyParser = express.json();


//This section helps insure bad actors can't inject code when we are accepting input.
const serializeNameRecord = namerecord => ({
  id: namerecord.id,
  name: xss(namerecord.name),
  gender: xss(namerecord.gender),
  era: xss(namerecord.era),
  recent: namerecord.recent,
});


//This Router is one of the two main router for the app, responding to incoming get requests that query
//our database of records, as well as allow new names to be insert into our records.
nameRecordsRouter
  .route('/api/namerecords')

  //This section handles all incoming get requests to this endpoint. It maps through all of our records,
  //and then responds with the corresponding data.
  .get((req, res, next) => {
    NameRecordsService.getAllNameRecords(req.app.get('db'))
      .then(record => {
        res.json(record.map(serializeNameRecord));
      })
      .catch(next);
  })

  //This section handles all incoming post requests to this route. It verifies that requests contain the 
  //neccesssary data and then handles the requests accordingly. 
  .post(bodyParser, (req, res, next) => {
    const { name, gender, era, recent } = req.body;
    const newNameRecord = { name, gender, era, recent };

    for (const field of ['name', 'gender', 'era']) {
      if (!newNameRecord[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        });
      }
    }

    const error = getNameRecordValidationError(newNameRecord);
    if (error) return res.status(400).send(error);
    NameRecordsService.insertNameRecord(
      req.app.get('db'),
      newNameRecord
    )
      .then(record => {
        logger.info(`New record was created. Name ${record.name} was created with ID ${record.id}.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${record.id}`))
          .json(serializeNameRecord(record));
      })
      .catch(next);
  });

//This router handles requests made for a specific record in our database. It accepts all types of requests
//and can handle all relevant CRUD functions.
nameRecordsRouter
  .route('/api/namerecords/:namerecord_id')
  
  //This section makes sure that the requested entry actually exists within our database.

  .all((req, res, next) => {
    const { namerecord_id } = req.params;
    NameRecordsService.getById(req.app.get('db'), namerecord_id)
      .then(record => {
        if (!record) {
          logger.error(`Request recieved with ID ${namerecord_id}. ID ${namerecord_id} is not valid.`)
          return res.status(404).json({
            error: { message: `A Name with ID ${namerecord_id} cannot be found. Please check your names ID and try again` }
          })
        }
        res.record = record;
        next();
      })
      .catch(next);
  })
  //This responds with the requested record, after the above section has confirmed it indeed exists.

  .get((req, res) => {
    res.json(serializeNameRecord(res.record));
  })
  //This section handles the delete requests, allowing a specific entry to be able to be deleted.

  .delete((req, res, next) => {
    const { namerecord_id } = req.params;
    NameRecordsService.deleteNameRecord(
      req.app.get('db'),
      namerecord_id
    )
      .then(numRowsAffected => {
        logger.info(`Name entry ${namerecord_id} was removed.`)
        res.status(204).end();
      })
      .catch(next);
  })
  //There may be times that a record has been incorrectly categorized, or a name misspelled. This 
  //section handles patch requests and allows that record to be updated. 

  .patch(bodyParser, (req, res, next) => {
    const { name, gender, era, recent } = req.body;
    const nameRecordToUpdate = { name, gender, era, recent };

    const numberOfValues = Object.values(nameRecordToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`No values were updated. Please pick new valid vaules and try again`)
      return res.status(400).json({
        error: {
          message: `To update a name record please provide an updated value for Name, Gender, or Era,`
        }
      });
    }

    const error = getNameRecordValidationError(nameRecordToUpdate);
    if (error) return res.status(400).send(error);
    
    NameRecordsService.updateNameRecord(
      req.app.get('db'),
      req.params.namerecord_id,
      nameRecordToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = nameRecordsRouter;
