if (typeof(exports)==="undefined") exports = {};

exports.rolesEnum = ["DocumentationEditor", "BoardPublisher", "CommentAuthor", "CommentReviewer"];

exports.hasRole = function(user, role) {
    if (!user) return false;
    if (user.siteAdmin) return true;
    if (user.roles && user.roles.indexOf(role) > -1) return true;
};

exports.isCuratorOf = function(user, orgName) {
    if (!user) return false;
    if (user.siteAdmin) return true;
    return (user.orgAdmin && user.orgAdmin.indexOf(orgName) >= 0)
        || (user.orgCurator && user.orgCurator.indexOf(orgName) >= 0);
};
    
exports.isOrgCurator = function(user) {     
    if (!user) return false;
    return exports.isOrgAdmin(user) || (user.orgCurator && user.orgCurator.length > 0);  
};

exports.isOrgAdmin = function(user) {
    if (!user) return false;
    return user.siteAdmin === true || (user.orgAdmin && user.orgAdmin.length > 0);  
};

exports.canComment = function(user) {
    return exports.hasRole(user, "CommentAuthor") || exports.isOrgCurator(user)
};