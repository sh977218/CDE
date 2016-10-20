var io = require('socket.io')(server);

exports.startListenComments = function(){
    io.on('connection', function (socket) {
        socket.emit('news', {hello: 'world'});
        socket.on('my other event', function (data) {
            console.log(data);
        });
    })
}