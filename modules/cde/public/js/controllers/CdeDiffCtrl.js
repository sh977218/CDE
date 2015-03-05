angular.module('cdeModule').controller('CdeDiffCtrl', ['$scope', 'CdeDiff', function($scope, CdeDiff) {
    var CdeDiffCtrl = this;
    
    // Put general (-1) rules first, specific rules secondly
    CdeDiffCtrl.pathFieldMap = {
        1: [
            {fieldName: "Naming", path: ["naming"]}
            , {fieldName: "Properties", path: ["naming"]}
        ]
        , 2: [
            {fieldName: "Concepts", path: ["dataElementConcept", "concepts"]}
        ]        
        , 3: [
            {fieldName: "Alternative Name", path: ["naming",-1,"designation"]}
            , {fieldName: "Alternative Definition", path: ["naming",-1,"definition"]}        
            , {fieldName: "Primary Name", path: ["naming",0,"designation"]}
            , {fieldName: "Primary Definition", path: ["naming",0,"definition"]}
        ]
        , 4: [
            {fieldName: "Permissible Values", path: ["valueDomain", "permissibleValues", -1, "permissibleValue"]}
        ]
    };
    
    $scope.nullsToBottom = function(obj) {
        return (angular.isDefined(obj.updated) ? 0 : 1);
    };    
    
    CdeDiffCtrl.comparePaths = function(patternPath,realPath){
        var equal = true;
        patternPath.forEach(function(el,i){
            if (typeof el === "number" && el===-1) return;
            if (el===realPath[i]) equal = equal && true;
            else equal = false;
        });
        return equal;
    };
        
    $scope.viewDiff = function (elt) {        
        CdeDiff.get({deId: elt._id}, function(diffResult) {
            diffResult.forEach(function(change){
                this.stringify = function(obj) {
                    return Object.keys(obj).map(function(f){
                        return f + ": " + obj[f];
                    }).join(", ");                    
                };
                if (change.kind==="E") {
                    change.modificationType = "Modified Field";
                    change.newValue = change.lhs;
                    change.previousValue = change.rhs;
                }
                if (change.kind==="A" && change.item.kind==="N") {
                    change.modificationType = "New Item";
                    change.newValue = this.stringify(change.item.rhs);                  
                }
                if (change.kind==="A" && change.item.kind==="D") {
                    change.modificationType = "Item Deleted";
                    change.newValue = this.stringify(change.item.lhs);
                }                
//                if (change.kind==="A" && change.item.rhs) {
//                    change.modificationType = "Deleted Item";
//                    change.previousValue = Object.keys(change.item.lhs).map(function(f){
//                        return f + ": " + change.item.lhs[f];
//                    }).join(", ");                   
//                }                
                CdeDiffCtrl.pathFieldMap[change.path.length].forEach(function(pathPair){
                    if (CdeDiffCtrl.comparePaths(pathPair.path, change.path)) change.fieldName = pathPair.fieldName;
                });
            });
            $scope.modifications = diffResult;
        });
    };
}]);