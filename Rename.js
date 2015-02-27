var walker = require('walk').walk('./modules/cde/public/js/controllers', { followLinks: false })
    , fs = require('fs')
    
;

var moduleName = "systemModule";

walker.on('file', function(root, stat, next) {
    var filePath = root + '/' + stat.name;
    fs.readFile(filePath, 'utf-8', function(err, input){
        if (err) throw err;

        try {
            var ctrlName = /function .+\(/.exec(input.substr(0,200))[0].replace("function ", "").replace("(","");
            var dependencies = /\(.+\)/.exec(input.substr(0,1000))[0].replace('(','').replace(')','').split(', ');
        } catch(e) {
            console.log(input.substr(0,200));
            throw e;
        }
        
        var newDefinition = moduleName + ".controller('" + ctrlName + "', ['" + dependencies.join("', '") + "', function("+dependencies.join(", ")+") {";
        
        var output = input.replace(/function.+{/,newDefinition);   
        output = output + "]);";
        fs.writeFile('./replace/'+stat.name, output, 'utf-8', function (err) {
            if (err) throw err;
            console.log('Replaced' + filePath);
        });
    });    
    next();
});