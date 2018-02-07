var restify = require('restify-clients');

//encapsula uma funcao para reaproveitamento
  function CartoesClient(){
    this._client = restify.createJsonClient({
      url:'http://localhost:3001'
    });
  }

  CartoesClient.prototype.autoriza = function(cartao, callback){
    this._client.post('/cartoes/autoriza', cartao , callback);
  }

// exporta para utilização
module.exports = function(){
  return CartoesClient;
}

