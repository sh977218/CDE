const nodemon = require('nodemon');

nodemon({})
    .on('start', () => {
        console.log('App has started');
    })
    .on('quit', () => {
        console.log('App has quit');
        process.exit();
    })
    .on('restart', files => {
        console.log('App restarted due to: ', files);
    });
