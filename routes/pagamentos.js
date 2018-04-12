module.exports = function(app){
    app.get('/pagamentos',function(req, res){ //req -> request; res -> response
        console.log('Recebida requisição de pagamentos na porta 3000.');
        res.send('OK.');
    });

    const PAGAMENTO_CRIADO = "CRIADO";
    const PAGAMENTO_CONFIRNADO = "CONFIRMADO";
    const PAGAMENTO_CANCELADO = "CANCELADO";

    //Listar
    app.get('/pagamentos/pagamento/:id', function(req, res){
        var id = req.params.id;
        console.log('Consultando pagamento '+id);

        var memcachedClient = app.services.memcachedClient();
        memcachedClient.get('pagamento-'+id, function(err, ret){
            if(err || !ret){
                console.log('MISS - chave não encontrada');
                var connection = app.persistence.connectionFactory();
                var pagamentoDAO = new app.persistence.pagamentoDAO(connection);

                pagamentoDAO.findById(id, function(erro, resultado){
                    if(erro){
                        console.log("Erro ao consultar");
                        res.status(500).send(erro);
                        return;
                    }
                    console.log('Pagamento encontrado: '+ JSON.stringify(resultado));
                    res.json(resultado);
                    return;
                });
            }
            //ENCONTRADO NO CACHE
            else {
                console.log('HIT - valor: ' + JSON.stringify(ret));
                res.json(ret);
                return;
            }
        });
    });

    //Atualização
    app.put('/pagamentos/pagamento/:id', function (req, res){

        var pagamento = {};
        var id = req.params.id;

        pagamento.id = id;
        pagamento.status = PAGAMENTO_CONFIRNADO;

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

    //TODO Atualização usando cache

    //Remoção do recurso (lógico: não remove na tabela, só muda o status)
    app.delete('/pagamentos/pagamento/:id', function (req, res){
        
                var pagamento = {};
                var id = req.params.id;
        
                pagamento.id = id;
                pagamento.status = PAGAMENTO_CANCELADO;
        
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

    //Criação de um novo recurso
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

                        pagamento.status = PAGAMENTO_CRIADO;
                        pagamento.data = new Date;
                
                        pagamentoDAO.save(pagamento, function(exception, result){
                            console.log('Pagamento criado: ' + JSON.stringify(pagamento));

                            var memcachedClient = app.services.memcachedClient();
                            memcachedClient.set('pagamento-'+result.insertId,pagamento, 60000, function(erro){
                                console.log('Nova chave adicionada no cache: pagamento-'+pagamento.id)
                            });


                            if(pagamento.forma_de_pagamento == 'cartao'){
                                var cartao = req.body["cartao"];
                                console.log(cartao);

                                //A chamada tem que ser igual ao nome do arquivo
                                var clienteCartoes = new app.services.clienteCartoes();

                                clienteCartoes.autoriza(cartao,
                                    function(error, request, response, retorno){
                                      if(error){
                                        console.log(error);
                                        res.status(400).send(error);
                                        return;
                                      }
                                      console.log(retorno);
                        
                                      res.location('/pagamentos/pagamento/' + result.insertId);
                                      pagamento.id = result.insertId;
                        
                                      var response = {
                                          dados_do_pagamento: pagamento,
                                          cartao: retorno,
                                        links: [
                                          {
                                            href:"http://localhost:3000/pagamentos/pagamento/"
                                                    + pagamento.id,
                                            rel:"confirmar",
                                            method:"PUT"
                                          },
                                          {
                                            href:"http://localhost:3000/pagamentos/pagamento/"
                                                    + pagamento.id,
                                            rel:"cancelar",
                                            method:"DELETE"
                                          }
                                        ]
                                      }
                        
                                      res.status(201).json(response);
                                      return;
                                });

                            } else{
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
    
                            }
                        });
                    }
        }
    });

};
