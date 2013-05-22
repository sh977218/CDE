
exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};

exports.loginForm = function(req, res){
    res.render('login');
};
exports.inlineTextArea = function(req, res){
    res.render('inlineTextArea');
};
exports.inlineText = function(req, res){
    res.render('inlineText');
};
exports.list = function(req, res){
    res.render('list');
};
