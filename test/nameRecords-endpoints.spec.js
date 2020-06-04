const knex = require('knex');
const fixtures = require('./nameRecords-fixtures');
const app = require('../src/app');


//The following tests ensure that the various endpoints work and that their functions run as expected. 

describe('Name Records Database Endpoints', () => {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => db('nameRecords').truncate());

  afterEach('cleanup', () => db('nameRecords').truncate());

  describe('Illegal request', () => {
    const testNameRecords = fixtures.makeNameRecordsArray();

    beforeEach('insert nameRecords', () => {
      return db
        .into('nameRecords')
        .insert(testNameRecords);
    });

    //These tests ensure that any attempt to access an endpoint without the required key gets a 404 response.
    it('responds with 401 Unauthorized for GET /nameRecords', () => {
      return supertest(app)
        .get('/nameRecords')
        .expect(401, { error: 'Unauthorized request' });
    });

    it('responds with 401 Unauthorized for POST /nameRecords', () => {
      return supertest(app)
        .post('/nameRecords')
        .send({ name: 'test-name', gender: 'M', era: 'Classic' })
        .expect(401, { error: 'Unauthorized request' });
    });

    it('responds with 401 Unauthorized for GET /nameRecords/:id', () => {
      const secondNameRecord = testNameRecords[1];
      return supertest(app)
        .get(`/nameRecords/${secondNameRecord.id}`)
        .expect(401, { error: 'Unauthorized request' });
    });

    it('responds with 401 Unauthorized for DELETE /nameRecords/:id', () => {
      const aNameRecord = testNameRecords[1];
      return supertest(app)
        .delete(`/nameRecords/${aNameRecord.id}`)
        .expect(401, { error: 'Unauthorized request' });
    });
  });

  //This test makes sure the endpoints respond with the expected data.
  describe('GET /nameRecords', () => {
    context('Given no nameRecords', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/nameRecords')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, []);
      });
    });

    context('Given there are nameRecords in the database', () => {
      const testNameRecords = fixtures.makeNameRecordsArray();

      beforeEach('insert nameRecords', () => {
        return db
          .into('nameRecords')
          .insert(testNameRecords);
      });

      it('gets the nameRecords from the store', () => {
        return supertest(app)
          .get('/nameRecords')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testNameRecords);
      });
    });
  });

  //This test makes sure when a specific record is requested the correct record is returned, or
  //if no record is present that is returned instead.
  describe('GET /nameRecords/:id', () => {
    context('Given no nameRecords', () => {
      it('responds 404 when nameRecord doesn\'t exist', () => {
        return supertest(app)
          .get('/nameRecords/123')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {
            error: { message: 'NameRecord Not Found' }
          });
      });
    });

    context('Given there are nameRecords in the database', () => {
      const testNameRecords = fixtures.makeNameRecordsArray();

      beforeEach('insert nameRecords', () => {
        return db
          .into('nameRecords')
          .insert(testNameRecords);
      });

      it('responds with 200 and the specified nameRecord', () => {
        const nameRecordId = 2;
        const expectedNameRecord = testNameRecords[nameRecordId - 1];
        return supertest(app)
          .get(`/nameRecords/${nameRecordId}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, expectedNameRecord);
      });
    });
  });

  //This test makes sure a delete request is handled properly, either deleting
  //the requested name from our database, or advising if there is no such record.
  describe('DELETE /nameRecords/:id', () => {
    context('Given no nameRecords', () => {
      it('responds 404 whe nameRecord doesn\'t exist', () => {
        return supertest(app)
          .delete('/nameRecords/123')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404, {
            error: { message: 'NameRecord Not Found' }
          });
      });
    });

    context('Given there are nameRecords in the database', () => {
      const testNameRecords = fixtures.makeNameRecordsArray();

      beforeEach('insert nameRecords', () => {
        return db
          .into('nameRecords')
          .insert(testNameRecords);
      });

      it('removes the nameRecord by ID from the store', () => {
        const idToRemove = 2;
        const expectedNameRecords = testNameRecords.filter(bm => bm.id !== idToRemove);
        return supertest(app)
          .delete(`/nameRecords/${idToRemove}`)
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
          .then(() =>
            supertest(app)
              .get('/nameRecords')
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(expectedNameRecords)
          );
      });
    });
  });


  //This test ensures that POST requests are handled correctly. Assuming the correct data
  //is supplied it works, otherwise an error is returned. 
  describe('POST /nameRecords', () => {
    it('responds with 400 missing \'name\' if not supplied', () => {
      const newNameRecordMissingName = {
        gender: 'M',
        era: 'Classic',
      };
      return supertest(app)
        .post('/nameRecords')
        .send(newNameRecordMissingName)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(400, {
          error: { message: '\'name\' is required' }
        });
    });

    it('adds a new nameRecord to the store', () => {
      const newNameRecord = {
        name: 'test-name',
        gender: 'M',
        era: 'Classic',
      };
      return supertest(app)
        .post('/nameRecords')
        .send(newNameRecord)
        .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newNameRecord.name);
          expect(res.body.gender).to.eql(newNameRecord.gender);
          expect(res.body.era).to.eql(newNameRecord.era);
          expect(res.body).to.have.property('id');
          expect(res.headers.location).to.eql(`/nameRecords/${res.body.id}`);
        })
        .then(res =>
          supertest(app)
            .get(`/nameRecords/${res.body.id}`)
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(res.body)
        );
    });
  });
});
