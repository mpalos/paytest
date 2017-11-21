
module.exports = function(app){
    app.get('/pagamentos',function(req, res){ //req -> request; res -> response
        console.log('Recebida requisição de pagamentos na porta 3000.');
        res.send('OK.');
    });
};
