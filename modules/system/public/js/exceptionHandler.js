(function(){
    window.onerror = function (msg, url, line) {
        console.log("onerror");
    };

    window.addEventListener('error', function (evt) {
        console.log("caught via addEventListener");
    });    
})();