function pagamentoDAO(connection) {
    this._connection = connection;
}

pagamentoDAO.prototype.save = function (pagamento, callback) {
    this._connection.query('INSERT INTO pagamentos SET ?', pagamento, callback);
}

pagamentoDAO.prototype.list = function (callback){
    this._connection.query('select * from pagamentos',callback);
}

pagamentoDAO.prototype.findById = function(id, callback){
    this._connection.query("select * from pagamentos where id = ?",[id],callback);
}

module.exports = function(){
    return pagamentoDAO;
}