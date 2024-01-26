const knex = require('knex');
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config');


//Welcome to the server file! This all important piece tells this API where to listen for requests 
//and where to find it's database.
const db = knex({
  client: 'pg',
    connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  }
});

app.set('db', db);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
