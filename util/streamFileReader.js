var fs = require('fs');

var file = process.argv[2];

fs.createReadStream(file)
    .pipe(fs.createWriteStream('CP_'+file+'_imageStream.jpg'))
    .on('finish', function(){
        console.log('arquivo escrito com stream')
    });
