
//This section handles the heavy lifting of the server. Once a request has been made,
//and after it has been appropriately routed by the router, these function are then called
//to make the desired updates.

const NameRecordsService = {
  //This function returns all name records present in our database.
  getAllNameRecords(knex) {
    return knex.select('*').from('namerecords');
  },
  //This function allows us to obtain a specific record using the ID.
  getById(knex, id) {
    return knex.from('namerecords').select('*').where('id', id).first();
  },
  //This function is used to add additional records to our database. 
  insertNameRecord(knex, newNameRecord) {
    return knex
      .insert(newNameRecord)
      .into('namerecords')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  //This function allows a record, as identified by ID, to be removed from our database. 
  deleteNameRecord(knex, id) {
    return knex('namerecords')
      .where({ id })
      .delete();
  },
  //This function allows a record to be updated when called during a patch request. 
  updateNameRecord(knex, id, newNameRecordFields) {
    return knex('namerecords')
      .where({ id })
      .update(newNameRecordFields);
  },
};

module.exports = NameRecordsService;
