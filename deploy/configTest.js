var msg1 = "Please specify application environment first.\n\
\n\
1) Create file config/<environment_name>.js,\n\
   e.g.  cp config.sample.js my-test-environment.js\n\
\n\
2) Set environment variable NODE_ENV to the name of your environment,\n\
   e.g.  export NODE_ENV=my-test-environment ";

var msg2 = "Cannot find " + '../config/'+process.env.NODE_ENV+'.js';

var fs = require('fs');

if (!process.env.NODE_ENV) {
    console.log(msg1);
    process.exit();
}

if (!fs.existsSync('./config/'+process.env.NODE_ENV+'.json')) {
    console.log(msg2);
    process.exit();
}
