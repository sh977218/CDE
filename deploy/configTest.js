var msg = "Please specify application environment first.\n\
\n\
1) Create file config/<environment_name>.js,\n\
   e.g.  cp config.sample.js my-test-environment.js\n\
\n\
2) Set environment variable NODE_ENV to the name of your environment,\n\
   e.g.  export NODE_ENV=my-test-environment "

if (!process.env.NODE_ENV) {
    console.log(msg);
    process.exit();
}