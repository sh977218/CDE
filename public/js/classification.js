angular.module('resources')
.factory('OrgClassification', function($resource) {
    return $resource('/classification/org');
})
.factory('CdeClassification', function($resource) {
    return $resource('/classification/cde');
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
.factory('CdeClassificationList', function($http) {
    return {
        addList: function(cde, classifications, cb) {
            var request = {
                cde: {_id: cde._id},
                classifications: classifications
            };
            $http.post('/classification/cde/addlist', request).success(function() {
                cb(cde);
            }).error(cb);
        }
    };
})
;