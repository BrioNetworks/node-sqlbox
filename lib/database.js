var mysql   = require('mysql');
var config  = require('./../config.json');
var logger  = require('./logger');

var ignore = [  mysql.ERROR_DB_CREATE_EXISTS,
                mysql.ER_BAD_NULL_ERROR,
                mysql.ERROR_TABLE_EXISTS_ERROR
            ];


function onError(database)
{
  database.on('error', function(err) {

    if (ignore.indexOf(err.number) + 1) { return; }

    logger.error('db error'+err.code);

    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      connect();                                  // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}


// single connection
var database;

function connect() {
  database = mysql.createConnection(config.dbConfig); 

  database.connect(function(err) {              
    if(err) {                                     
      console.log('error when connecting to db:', err);
      setTimeout(connect, 2000); 
      }                          
    });                         
                               
  onError(database);                                    
}

connect();
module.exports = database;

