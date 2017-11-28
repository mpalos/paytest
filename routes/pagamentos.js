
module.exports = function(app){
    app.get('/pagamentos',function(req, res){ //req -> request; res -> response
        console.log('Recebida requisição de pagamentos na porta 3000.');
        res.send('OK.');
    });

    app.post('/pagamentos/pagamento', function(req,res){
        var pagamento = req.body;
        console.log('Processando requisicao de um novo pagamento');

        pagamento.status = 'CRIADO';
        pagamento.data = new Date;


        res.send(pagamento);
    });
};
