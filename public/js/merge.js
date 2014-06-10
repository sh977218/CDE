angular.module('resources')
.factory('MergeCdes', function(DataElement, CDE) {
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
        /*var classif = function(cde) {
                service.transferClassifications(cde, function() {
                    service.retireSource(service.source, service.destination, function() {
                        if (callback) callback(cde);
                    });                     
                });
            };
        if (fields.ids || fields.properties || fields.naming) DataElement.save(service.destination, classif);
        else classif(service.destination);*/
        service.transferClassifications(service.source, service.destination);
        DataElement.save(service.destination, function (cde) {
            service.retireSource(service.source, service.destination, function() {
                if (callback) callback(cde);
            });             
        });
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
    /*service.transferClassifications = function (target, callback) {
        var classifications = [];
        service.source.classification.forEach(function(stewardOrgClassifications) {
            var orgName = stewardOrgClassifications.stewardOrg.name;
            stewardOrgClassifications.elements.forEach(function(conceptSystem) {
                var conceptSystemName = conceptSystem.name;
                conceptSystem.elements.forEach(function(concept) {
                    var conceptName = concept.name;
                    classifications.push({
                        orgName: orgName
                        , conceptSystem: conceptSystemName                      
                        , concept: conceptName                                
                    });   
                });
            });
        });
        Classification.addListToCde({
            classifications: classifications
            , deId: target._id
        }, callback);
    };*/
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
    service.transferClassifications = function (source, destination) {
        //TO-DO: go through tree of classifications and call export.addCategory
        source.classification.forEach(function(stewardOrgSource){
            var st = exports.findSteward(destination, stewardOrgSource.stewardOrg.name);
            if (st) {
                var stewardOrgDestination = st.object;
            } else {
                destination.classification.push({stewardOrg: {name: stewardOrgSource.stewardOrg.name}, elements: []});
                var stewardOrgDestination = destination.classification[destination.classification.length-1];
            }
            stewardOrgDestination.name = stewardOrgDestination.stewardOrg.name;
            service.treeChildren(stewardOrgSource, [], function(path) {
                exports.addCategory(stewardOrgDestination.elements, path, function() {
                    console.log(destination);
                });
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