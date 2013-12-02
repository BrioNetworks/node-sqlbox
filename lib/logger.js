var winston      = require('winston');
var config       = require('./../config.json');

var logger = new (winston.Logger)({
    //exitOnError: false, //don't crash on exception
    levels : {'box' : 6},
    transports: [
        new (winston.transports.Console)(), //always use the console
        //new (winston.transports.File)({ filename: './storage/log/server.log' }), //log everything to the server.log
        new (winston.transports.File)({ level: 'error', filename: './storage/log/error.log', handleExceptions: true }), //log errors and exceptions to the error.log
        //new (winston.transports.File)({ level: 'warn', filename:'./storage/log/warn.log' }), //log warn to the warn.log
        //new (winston.transports.File)({ level: 'info', filename:'./storage/log/info.log' }), //log info to the info.log
        new (winston.transports.File)({ level: 'box', filename:'./storage/log/box.log' })
    ],
    exceptionHandlers: [
      new winston.transports.File({ filename: './storage/log/exceptions.log' })
    ]
});

module.exports = logger;