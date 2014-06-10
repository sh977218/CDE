angular.module('resources')
.factory('MergeCdes', function(DataElement, CDE, CdeClassificationList) {
    var service = this;
    service.approveMergeMessage = function(message) { 
        service.approveMerge(message.typeMergeRequest.source.object, message.typeMergeRequest.destination.object, message.typeMergeRequest.fields, function() {
            service.closeMessage(message);
        });
    };
    service.approveMerge = function(source, destination, fields, callback) {
        service.source = source;
        service.destination = destination;
        Object.keys(fields).forEach(function(field) {
            if (fields[field]) {
                service.transferFields(service.source, service.destination, field);
            }
        });
       
        if (fields.ids || fields.properties || fields.naming) {
            service.transferClassifications(service.source, service.destination, "direct");
            DataElement.save(service.destination, function (cde) {
                service.retireSource(service.source, service.destination, function() {
                    if (callback) callback(cde);
                });             
            });
        } else {
            var classifications = [];
            service.transferClassifications(service.source, service.destination, "api", function(path) {
                classifications.push(path);
            });
            CdeClassificationList.addList(service.destination, classifications, callback);
        }
    };
    service.transferFields = function(source, destination, type) {
        if (!source[type]) return;
        var fieldsTransfer = this;
        service.alreadyExists = function(obj) {
            delete obj.$$hashKey;
            return destination[type].map(function(obj) {return JSON.stringify(obj)}).indexOf(JSON.stringify(obj))>=0;
        };
        source[type].forEach(function(obj) {            
            if (fieldsTransfer.alreadyExists(obj)) return;
            destination[type].push(obj);
        });
    };
    service.treeChildren = function(tree, path, cb) {
        tree.elements.forEach(function(element) {
            var newpath = path.slice(0);
            newpath.push(element.name);
            if (element.elements.length>0) {
                service.treeChildren(element, newpath, cb);
            } else {
                cb(newpath);
            }
        });
    };
    service.transferClassifications = function (source, destination, type, cb) {
        source.classification.forEach(function(stewardOrgSource){
            var st = exports.findSteward(destination, stewardOrgSource.stewardOrg.name);
            if (st) {
                var stewardOrgDestination = st.object;
            } else {
                destination.classification.push({stewardOrg: {name: stewardOrgSource.stewardOrg.name}, elements: []});
                var stewardOrgDestination = destination.classification[destination.classification.length-1];
            }
            stewardOrgDestination.name = stewardOrgDestination.stewardOrg.name;
            service.treeChildren(stewardOrgSource, [], function(path){
                if (type==='direct'){
                    exports.addCategory(stewardOrgDestination.elements, path);
                }
                if (type==='api'){
                    path.unshift(stewardOrgSource.stewardOrg.name);
                    cb(path);
                }                
                
            });
        });
    };
    service.retireSource = function(source, destination, cb) {
        CDE.retire(source, function() {
            if (cb) cb();
        });
    }; 
    return service;
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
            getMail: function(type, query, cb) {              
                $http.post("/mail/messages/"+type, query).then(function(response) {
                    cb(response.data);
                });
            },
            updateMessage: function(msg, success, error) {
                $http.post('/mail/messages/update', msg).success(success).error(error);
            }
        };        
    }) ;