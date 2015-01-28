if (typeof(exports)==="undefined") exports = {};

exports.rolesEnum = ["DocumentationEditor","BoardPublisher"];

exports.hasRole = function(user, role) {
    if (!user) return false;
    if (user.siteAdmin) return true;
    if (user.roles && user.roles.indexOf(role) > -1) return true;
};

exports.isCuratorOf = function(user, orgName) {
    if (!user) return false;
    if (user.siteAdmin) return true;
    return (req.user.orgAdmin && req.user.orgAdmin.indexOf(orgName) < 0)
        || (req.user.orgCurator && req.user.orgCurator.indexOf(orgName) < 0);
};
