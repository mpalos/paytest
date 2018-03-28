var mysql = require('mysql');

function createDBConnection(){
    return mysql.createConnection({
        host: '172.18.0.2',
        user: 'paytest',
        password: 'paytest',
        database: 'paytest'
    });
}

module.exports = function(){
    return createDBConnection;
}