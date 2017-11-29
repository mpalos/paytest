
module.exports = function(app){
    app.get('/pagamentos',function(req, res){ //req -> request; res -> response
        console.log('Recebida requisição de pagamentos na porta 3000.');
        res.send('OK.');
    });

    app.post('/pagamentos/pagamento', function(req,res){
        var pagamento = req.body;

        //Algumas validações
        req.assert("forma_de_pagamento", "Forma de Pagamento é obrigatória").notEmpty();
        req.assert("valor", "Valor é obrigatório e deve ser número").notEmpty().isFloat();
        req.assert("moeda", "Valor é obrigatório e deve ter 3 caracteres").notEmpty().len(3,3);

        var errors = req.validationErrors();

        if (errors){
            console.log("Erros de validação encontrados");
            res.status(400).send(errors);
        }

        else{

            console.log('Processando um novo pagamento...');
            
                    var connection = app.persistence.connectionFactory();
                    var pagamentoDAO = new app.persistence.pagamentoDAO(connection);
            
                    pagamento.status = "CRIADO";
                    pagamento.data = new Date;
            
                    pagamentoDAO.save(pagamento, function(exception, result){
                        console.log('Pagamento criado: ' + result);
                        res.location('/pagamentos/pagamento/' + result.insertId);
                        pagamento.id = result.insertId;

                        res.status(201).json(pagamento);
                    });
        }
    });
};
