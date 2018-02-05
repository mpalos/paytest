var restify = require('restify');

//encapsula uma funcao para reaproveitamento
function clientesCartoes() {
    this._client = restify.createJsonClient({
      url: 'http://localhost:3000',
      version: '~1.0'
    });
  }

  clientesCartoes.prototype.autoriza = function (cartao, callback){
    this._client.post('/cartoes/autoriza', cartao, callback);       
}

// exporta para utilização
module.exports = function(){
    return clientesCartoes;
}