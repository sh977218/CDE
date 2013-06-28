exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};
exports.loginForm = function(req, res){
    res.render('login');
};
exports.signup = function(req, res){
    res.render('signup');
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
exports.cdereview = function(req, res){
    res.render('cdereview');
};
exports.nlmaccountmanagement = function(req, res){
    res.render('nlmaccountmanagement');
};
exports.deview = function(req, res){
    res.render('deview');
};

