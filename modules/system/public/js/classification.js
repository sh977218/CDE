angular.module('classification', ['ngResource'])
.factory('OrgClassification', function($resource, $http) {
    return {
        resource: $resource('/classification/org')
        , rename: function(orgName, path, newname, cb) {
            var data = {orgName: orgName, categories: path, newname: newname};
            $http.post('/classification/rename', data).success(cb);
        }
    };
})
.factory('CdeClassification', function($resource) {
    return $resource('/classification/elt');
})
.factory('BulkClassification', function($resource, $http) {
    return {
        classifyTinyidList: function(list, newClassif, cb) {
            var data = {classification: newClassif, elements: list};
            $http.post('/classification/bulk/tinyid', data).success(cb);
        }
    };
})
.factory("ClassificationTree", function() {
    return {
        getCategories: function(org, newClassification, level) {
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
})
.factory('CdeClassificationTransfer', function($http) {
    return {
        byTinyIds: function(tinyIdSource, tinyIdTarget, cb) {
            var request = {
                cdeSource: {tinyId: tinyIdSource},
                cdeTarget: {tinyId: tinyIdTarget}
            };
            $http.post('/classification/cde/moveclassif', request).success(cb).error(cb);
        }
    };
})

;