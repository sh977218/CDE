angular.module('classification', ['ngResource'])
.factory('OrgClassification', ["$resource", "$http", function($resource) {
    return {
        resource: $resource('/classification/org')
    };
}])
.factory('CdeClassification', ["$resource", function($resource) {
    return $resource('/classification/cde');
}])
.factory('FormClassification', ["$resource", function($resource) {
    return $resource('/classification/form');
}])
.factory('BulkClassification', ["$resource", "$http", function($resource, $http) {
    return {
        classifyTinyidList: function(list, newClassif, cb) {
            var data = {classification: newClassif, elements: list};
            $http.post('/classification/bulk/tinyId', data).then(function onSuccess(response) {
                cb(response.data);
            }, function () {});
        }
    };
}])
.factory("ClassificationTree", [function() {
    return {
        getCategories: function(org, newClassification, level) {
            if (!org) return [];
            var elt = org.classifications;
            var selectedLast = false;
            for (var i = 0; i < level; i++) {
                var choice  = 0;
                selectedLast = false;
                for (var j = 0; j < elt.length; j++) {
                    if (elt[j].name === newClassification.categories[i]) {
                        elt[choice]["elements"] ? elt = elt[choice]["elements"] : elt = [];
                        selectedLast = true;
                        break;
                    }
                    choice++;
                }
            }
            if (level>0 && !selectedLast) return [];
            else return elt;
        }
        , wipeRest: function(newClassification, num) {
            newClassification.categories.splice(num,Number.MAX_SAFE_INTEGER);
        }
    };
}])
.factory('CdeClassificationTransfer', ["$http", function( $http) {
    return {
        byTinyIds: function(tinyIdSource, tinyIdTarget, cb) {
            var request = {
                cdeSource: {tinyId: tinyIdSource},
                cdeTarget: {tinyId: tinyIdTarget}
            };
            $http.post('/classification/cde/moveclassif', request).then(function onSuccess(response) {
                cb(response);
            }).catch(function onError(response) {
                cb(response);
            });
        }
    };
}])
.factory('ClassificationPathBuilder', [function() {
    return {
        constructPath: function(org, pathArray) {
            var tempPath = org;

            if(pathArray && pathArray.length>0) {
                for(var i=0; i<pathArray.length; i++) {
                    tempPath += ' / ' + pathArray[i];
                }
            }

            return tempPath;
        }
    };
}])
;