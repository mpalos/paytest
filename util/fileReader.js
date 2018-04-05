var fs = require('fs');

var file = process.argv[2];

fs.readFile(file,function(error, buffer){
    console.log('arquivo lido');

    fs.writeFile('CP_'+file,buffer,function(error){
        console.log('arquivo escrito');
    });

});