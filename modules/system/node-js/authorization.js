var authorizationShared = require('../shared/authorizationShared');

exports.checkOwnership = function(dao, id, req, cb) {
    if (req.isAuthenticated()) {
        dao.byId(id, function (err, elt) {
            if (err || !elt) {
                return cb("Element does not exist.", null);
            }
            if (!authorizationShared.isCuratorOf(req.user,elt.stewardOrg.name)) {
                return cb("You do not own this element.", null);
            } else {
                cb(null, elt);
            }
        });
    } else {
        return cb("You are not authorized.", null);                   
    }
};

// Check if user is site admin or org admin for at least one org
exports.isSiteOrgAdmin = function(req) {
    if(req.isAuthenticated() && (req.user.siteAdmin || (req.user.orgAdmin && req.user.orgAdmin.length >= 0))) {
        return true;
    }    
    return false;
};
