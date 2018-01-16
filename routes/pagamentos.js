module.exports = function(app){
    app.get('/pagamentos',function(req, res){ //req -> request; res -> response
        console.log('Recebida requisição de pagamentos na porta 3000.');
        res.send('OK.');
    });

    app.put('/pagamentos/pagamento/:id', function (req, res){

        var pagamento = {};
        var id = req.params.id;

        pagamento.id = id;
        pagamento.status = "CONFIRMADO";

        var connection = app.persistence.connectionFactory();
        var pagamentoDAO = new app.persistence.pagamentoDAO(connection);
        
        //Implantação da função atualiza
        pagamentoDAO.update(pagamento, function(erro){
            if(erro) {
                res.status(500).send(erro);
                return;
            }
            res.send(pagamento);

        });

    });

    app.delete('/pagamentos/pagamento/:id', function (req, res){
        
                var pagamento = {};
                var id = req.params.id;
        
                pagamento.id = id;
                pagamento.status = "CANCELADO";
        
                var connection = app.persistence.connectionFactory();
                var pagamentoDAO = new app.persistence.pagamentoDAO(connection);
                
                //Implantação da função atualiza
                pagamentoDAO.update(pagamento, function(erro){
                    if(erro) {
                        res.status(500).send(erro);
                        return;
                    }
                    res.status(204).send(pagamento);
        
                });
        
            });        

    app.post('/pagamentos/pagamento', function(req,res){
        var pagamento = req.body["pagamento"];

        //Algumas validações
        req.assert("pagamento.forma_de_pagamento", "Forma de Pagamento é obrigatória").notEmpty();
        req.assert("pagamento.valor", "Valor é obrigatório e deve ser número").notEmpty().isFloat();
        req.assert("pagamento.moeda", "Valor é obrigatório e deve ter 3 caracteres").notEmpty().len(3,3);

        var errors = req.validationErrors();

        if (errors){
            console.log("Erros de validação encontrados");
            res.status(400).send(errors);
        }

        else{

            console.log('Processando um novo pagamento...');
            
                    var connection = app.persistence.connectionFactory();
                    var pagamentoDAO = new app.persistence.pagamentoDAO(connection);
            
                    if(errors){
                        console.log('Erro ao inserir no banco: ' + errors);
                        res.status(500).send(errors);
                    } else {
                        pagamento.status = "CRIADO";
                        pagamento.data = new Date;
                
                        pagamentoDAO.save(pagamento, function(exception, result){
                            console.log('Pagamento criado: ' + result);
                            res.location('/pagamentos/pagamento/' + result.insertId);
                            pagamento.id = result.insertId;
    
                            var response = {
                                dados_do_pagamento: pagamento,
                                links: [
                                    {
                                        href: "http://localhost:3000/pagamentos/pagamento/"
                                                + pagamento.id,
                                        rel: "confirmar",
                                        method: "PUT"
                                    },
                                    {
                                        href: "http://localhost:3000/pagamentos/pagamento/"
                                                + pagamento.id,
                                        rel: "cancelar",
                                        method: "DELETE"
                                    }
    
                                ]
                            }
    
                            res.status(201).json(response);
    
                        });
                    }
        }
    });
};
