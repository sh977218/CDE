//TODO - refactor all CDE related services into one factory
// with prospective methods.
angular.module('resources', ['ngResource'])
    .factory('BoardSearch', function($resource) {
        return $resource('/listboards');
    })
    .factory('DataElement', function($resource) {
        return $resource('/dataelement/:deId/:type', {deId: '@deId', type: '_id'}, {update: {method: 'PUT'}, save: {method: 'POST', params: {type: null} }});
    })
    .factory('PriorCdes', function($resource) {
        return $resource('/priorcdes/:cdeId', {cdeId: '@cdeId'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('CdesInForm', function($resource) {
        return $resource('/cdesinform/:formId', {formId: '@formId'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('CdeDiff', function($resource) {
        return $resource('/cdediff/:deId', {deId: '@deId'});
    })           
    .factory('Auth', function($http){
        return {
            register: function(user, success, error) {
                $http.post('/register', user).success(success).error(error);
            },
            login: function(user, success, error) {
                $http.post('/login', user).success(success).error(error);
            },
            logout: function(success, error) {
                $http.post('/logout').success(success).error(error);
            }
        };
    })
    .factory("Attachment", function($http) {
        return {
          remove: function(dat, success, error) {
              $http.post('/removeAttachment', dat).success(success).error(error);
          }
          , setDefault: function(dat, success, error) {
              $http.post('/setAttachmentDefault', dat).success(success).error(error);
          }
        };
    })
    .factory("Classification", function($http) {
        return {
          remove: function(dat, success, error) {
              $http.post('/removeClassification', dat).success(success).error(error);
          }
          , add :function(dat, success, error) {
              $http.post('/addClassification', dat).success(success).error(error);
          }
          , addToOrg: function(dat, success, error) {
              $http.post('/addClassificationToOrg', dat).success(success).error(error);              
          }
          , addListToCde: function(dat, success, error) {
              $http.post('/addClassificationGroup', dat).success(success).error(error);
          }
        };
    })
    .factory("UsedBy", function($http) {
        return {
          remove: function(dat, success, error) {
              $http.post('/removeUsedBy', dat).success(success).error(error);
          }
          , add :function(dat, success, error) {
              $http.post('/addUsedBy', dat).success(success).error(error);
          }
        };
    })
    .factory("Comment", function($http) {
        return {
          addComment: function(comment, success, error) {
            $http.post('/addComment', comment).success(success).error(error);
          }
          , removeComment: function(dat, success, error) {
              $http.post('/removeComment', dat).success(success).error(error);
          } 
        };
    })
    .factory("AccountManagement", function($http) {
        return {
          addSiteAdmin: function(user, success, error) {
            $http.post('/addSiteAdmin', user).success(success).error(error);
          }  
          , removeSiteAdmin: function(user, success, error) {
            $http.post('/removeSiteAdmin', user).success(success).error(error);
          }  
          , addOrgAdmin: function(user, success, error) {
            $http.post('/addOrgAdmin', user).success(success).error(error);
          }  
          , addOrgCurator: function(user, success, error) {
            $http.post('/addOrgCurator', user).success(success).error(error);
          }  
          , removeOrgAdmin: function(data, success, error) {
            $http.post('/removeOrgAdmin', data).success(success).error(error);
          }  
          , removeOrgCurator: function(data, success, error) {
            $http.post('/removeOrgCurator', data).success(success).error(error);
          }  
          , addOrg: function(name, success, error) {
            $http.post('/addOrg', name).success(success).error(error);
          }  
          , removeOrg: function(id, success, error) {
            $http.post('/removeOrg', id).success(success).error(error);
          }  
        };
    })
    .factory("LinkToVsac", function($resource) {
        return $resource(
                "/linktovsac", 
                {cde_id: '@cde_id', vs_id: '@vs_id'}, 
                {link: {method: 'POST'}}
            );
    })
    .factory('Form', function($resource) {
        return $resource('/form/:formId', {formId: '@formId'});
    })
    .factory('FormList', function($resource) {
        return $resource('/formlist');
    })
    .factory('CdesForApproval', function($resource) {
        return $resource('/cdesforapproval');
    })
    .factory('MyCart', function($resource) {
        return $resource('/cartcontent');
    })
    .factory("AddToCart", function($resource) {
        return $resource(
                "/addtocart/:formId", 
                {formId: '@formId'}, 
                {add: {method: 'POST'}}
            );
    })
    .factory("AddCdeToForm", function($resource) {
        return $resource(
                "/addcdetoform/:cdeId/:formId", 
                {formId: '@formId', cdeId: '@cdeId'}, 
                {add: {method: 'POST'}}
            );
    })
    .factory("RemoveFromCart", function($resource) {
        return $resource(
                "/removefromcart/:formId", 
                {formId: '@formId'}, 
                {add: {method: 'POST'}}
            );
    })
    .factory('Myself', function($resource) {
        return $resource('/user/me');
    })
    .factory('ViewingHistory', function($resource) {
        return $resource('/viewingHistory/:start', {start: '@start'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('Board', function($resource) {
        return $resource('/board/:id/:start', {id: '@id', start: '@start'}, 
            {'getCdes': {method: 'GET', isArray: true}});
    })
    .factory('MergeRequest', function(Mail) {
        return {
          create: function(dat, success, error) {              
              var message = {
                  recipient: {recipientType: "stewardOrg", name: dat.recipient},
                  author: {authorType: "user", name: dat.author},
                  date: new Date(),
                  type: "Merge Request",
                  typeMergeRequest: dat.mergeRequest
              };
              Mail.sendMessage(message, success);
          }
        };
    })   
    .factory('Mail', function($http) {
        return {
            sendMessage: function(dat, success, error) {              
                $http.post('/mail/messages/new', dat).success(success).error(error);
            },
            getMail: function(user, type, cb) {              
                $http.get("/mail/messages/"+type).then(function(response) {
                    cb(response.data);
                });
            },
            updateMessage: function(msg, success, error) {
                $http.post('/mail/messages/update', msg).success(success).error(error);
            }
        };        
    }) 
    .factory('CdeList', function($http) {
        return {
            byUuidList: function(ids, cb) {              
                $http.post("/cdesByUuidList", ids).then(function(response) {
                    cb(response.data);
                });
            }
        } 
    })
    .factory('CDE', function($http) {
        return {
            retire: function(cde, cb) {              
                $http.post("/retireCde", cde).then(function(response) {
                    cb(response.data);
                });
            }
        } 
    })    
    ;