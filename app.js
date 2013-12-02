
var request 	= require('request');
var mysql		= require('mysql');
var config		= require('./config.json');
var async		= require('async');
var database	= require('./lib/database.js')
var logger  	= require('./lib/logger');


var boxIndex = -1;
function sendMessages (rows) 
{
	async.map(rows, function (row, callback) {
					
		var qs  = config.query;

		for (col in row) {
			qs.replace('{' + col + '}', row[col]);
		}

		boxIndex = (boxIndex + 1) % config.boxes.length;

		var url = config.boxes[boxIndex].url + qs; 

		request.get({url : url}, function (e, r, body) {
			if (e || r.statusCode != 200) {
				callback(null, row);
			}
			else {
				console.log('message sent successfully ' + JSON.stringify(row));
				//log the message
				logger.box(url);

				callback(null, null);
			}
		})

	}, function (err, results) {
		results = results.filter(function (item) {
			return item != null;
		})

		if (results.length == 0) {
		}
		sendMessages(results);
	});
}

function work () {
	async.forever(function (callback) {
		database.query("SELECT * from " + config.options.table + ' ORDER BY sql_id ASC LIMIT ' + config.options.limit, function (err, rows, fields) {
			
			if (err) {
				callback(err);
				return;
			}

			if (rows.length == 0) {
				//handle no result case wait for given time
				console.log('no records waiting '+config.options.waitTime);
				setTimeout(work, config.options.waitTime * 1000);
				return;
			}

			var ids = rows.map(function (row) {return row.sql_id}).join(',');

			//delete the selected messages
			database.query("DELETE from " + config.options.table + ' WHERE sql_id in (' + ids + ')', function  (err) {
				if (!err) {
					sendMessages(rows);
					callback(null);
				}
				else {
					callback(err);
				}
			})
		});
	}, function (err) {
		if (err.fatal) { //connection terminated, reconnect
			main();
		}
		else {
			console.log(err);
			//handle this errors
			logger.warn(err);
		}
	});
}

work();