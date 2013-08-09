db.users.drop();
db.dataelements.drop();
db.regAuths.drop();
db.users.insert({username: 'nlm', password: 'nlm', siteAdmin: true});

