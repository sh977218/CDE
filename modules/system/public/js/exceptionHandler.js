(function(){
    var handleError = function(message, name, stack) {
        try {
            if (message.indexOf("[$compile:tpload]")>-1) return;
            if (message.indexOf("'Range.detach' is now a no-op")) return;
            var req = new XMLHttpRequest();
            var data = {
                message:message
                , name: name
                , stack: stack
            };
            req.open("post", "logClientException", true);
            req.setRequestHeader('Content-type', 'application/json');
            req.send(JSON.stringify(data)); 
        } catch(e) {}
    }; 
//    window.onerror = function (msg, url, line) {
//        handleError(msg);
//    };

    window.addEventListener('error', function (evt) {        
        handleError(evt.error.message, evt.error.message, evt.error.stack);
    });
})();

