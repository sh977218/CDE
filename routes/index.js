
exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.loginForm = function(req, res){
    res.render('login');
};
exports.list = function(req, res){
    res.render('list');
};
exports.cart = function(req, res){
    res.render('cart');
};
exports.listforms = function(req, res){
    res.render('listforms');
};
exports.createform = function(req, res){
    res.render('createform');
};
exports.nlmreleased = function(req, res){
    res.render('nlmreleased');
};

