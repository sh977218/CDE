angular.module('systemModule').controller('AccountManagementCtrl',
    ['$scope', '$http', '$timeout', '$location', 'AccountManagement', 'userResource', 'Alert', '$uibModal', 'OrgHelpers',
        function($scope, $http, $timeout, $location, AccountManagement, userResource, Alert, $modal, OrgHelpers)
{
    $scope.admin = {};
    $scope.newOrg = {};
    $scope.orgAdmin = {};
    $scope.orgCurator = {};
    $scope.curator = {};
    $scope.transferStewardObj = {from:'', to:''};
    $scope.allUsernames = [];

    function resetTransferStewardObj() {
        $scope.transferStewardObj.from = '';
        $scope.transferStewardObj.to = '';
    }

    function resetOrgCuratorForm() {
        $scope.orgCurator.username = "";
        $scope.curator = {};
    }

    $http.get("/systemAlert").then(function onSuccess(response) {
       $scope.broadcast = {message: response.data}; 
    }).catch(function onError() {});

    var allPropertyKeys = [];
    var allTags = [];
    $scope.getOrgs = function(cb) {
        $http.get("/managedOrgs").then(function(response) {
            $scope.orgs = response.data.orgs;
            $scope.orgNames = $scope.orgs.map(function(o) {return o.name;});
            $scope.orgs.forEach(function (o) {
                if (o.propertyKeys) {
                    allPropertyKeys = allPropertyKeys.concat(o.propertyKeys);
                }
                if (o.nameTags) {
                    allTags = allTags.concat(o.nameTags);
                }
            });
            allPropertyKeys = allPropertyKeys.filter(function(item, pos, self) {
                return self.indexOf(item) === pos;
            });
            allTags = allTags.filter(function(item, pos, self) {
                return self.indexOf(item) === pos;
            });
            if (cb) cb();
        });
    };
    $scope.getOrgs();

    $scope.getMyOrgAdmins = function() {
        $http.get("/myOrgsAdmins").then(function(response) {
            $scope.myOrgAdmins = response.data.orgs;
            if ($scope.myOrgAdmins && $scope.myOrgAdmins.length > 0)
                $scope.admin.orgName = $scope.myOrgAdmins[0].name;
        }, function () {});
    };
    $scope.getMyOrgAdmins();

    // Retrieve orgs user is curator of
    $scope.getOrgCurators = function() {
        $http.get("/orgCurators").then(function(response) {
            $scope.orgCurators = response.data.orgs;
        });
    };
    $scope.getOrgCurators(); 
    
    $scope.addSiteAdmin = function() {
        AccountManagement.addSiteAdmin({username: $scope.admin.username},
            function(res) {
                  Alert.addAlert("success", res);
                  $scope.siteAdmins = $scope.getSiteAdmins();
            }, function () {
                Alert.addAlert("danger", "There was an issue adding this administrator.");
            }
        );
        $scope.admin.username = "";
    };
    
    $scope.removeSiteAdmin = function(byId) {
       AccountManagement.removeSiteAdmin({
            id: byId
            },
            function(res) {
                  Alert.addAlert("success", res);
                  $scope.siteAdmins = $scope.getSiteAdmins();
            }, function (){
               Alert.addAlert("danger", "There was an issue adding this administrator.");
            }
        );
    };

    $scope.addOrgCurator = function() {
        AccountManagement.addOrgCurator({
            username: $scope.orgCurator.username
            , org: $scope.curator.orgName
            },
            function(res) {
                  Alert.addAlert("success", res);
                  $scope.orgCurators = $scope.getOrgCurators(); 
            }, function () {
                Alert.alert("An error occured.");
            }
        );
        resetOrgCuratorForm();
    };
        
    $scope.removeOrgCurator = function(orgName, userId) {
        AccountManagement.removeOrgCurator({
            orgName: orgName
            , userId: userId
            },
            function (res) {
                Alert.addAlert("success", res);
                $scope.orgCurators = $scope.getOrgCurators(); 
            }, function () {
                Alert.alert("An error occured.");
            }
        );
    };

    $scope.addOrg = function() {
        AccountManagement.addOrg(
            {name: $scope.newOrg.name, longName: $scope.newOrg.longName, workingGroupOf: $scope.newOrg.workingGroupOf}
            , function(res) {
                Alert.addAlert("success", res);
                $scope.orgs = $scope.getOrgs();
                $scope.newOrg = {};
            }, function() {
                Alert.alert("An error occured.");
            }
        );
    };

    $scope.removeOrg = function(byId) {
       AccountManagement.removeOrg({
            id: byId
            },
            function(res) {
                Alert.addAlert("success", res);
                $scope.orgs = $scope.getOrgs();
            }, function () {
               Alert.alert("An error occured.");
           }
        );
    };

    $scope.removePropertyFromOrg = function(p, org) {
        org.propertyKeys = org.propertyKeys.filter(function (k) {
            return k !== p;
        });
        $scope.updateOrg(org);
    };
    $scope.removeTagsFromOrg = function(c, org) {
        org.nameTags = org.nameTags.filter(function (k) {
            return k !== c;
        });
        $scope.updateOrg(org);
    };

    $scope.addOrgTags = function(org) {
        $modal.open({
            animation: false,
            templateUrl: '/system/public/html/addValueModal.html',
            controller: function () {}
        }).result.then(function (newValue) {
            org.nameTags.push(newValue);
            $scope.updateOrg(org);
        }, function () {});
    };

    $scope.updateOrg = function (org) {
        $timeout(function(){
            AccountManagement.updateOrg(org,
                function(res) {
                    $scope.orgs = $scope.getOrgs(function () {
                        OrgHelpers.getOrgsDetailedInfoAPI(function () {
                            Alert.addAlert("success", res);
                        });
                    });
                },
                function(res) {
                    Alert.addAlert("danger", res);
                }
            );
        },0);
    };
    
    $scope.saveMessage = function() {
        $http.post('/systemAlert', {alert: $scope.broadcast.message});
    };
    
    $scope.transferStewardFunc = function() {
        AccountManagement.transferSteward($scope.transferStewardObj,
            function(successMsg) {
                Alert.addAlert("success", successMsg);
                resetTransferStewardObj();
            },
            function(errorMsg) {
                Alert.addAlert("danger", errorMsg);
                resetTransferStewardObj();
            }
        );
    };
    
    $scope.getAllUsernames = function() {
        AccountManagement.getAllUsernames(
            function(usernames) {
                $scope.allUsernames = [];
            
                // Transform array of username objects to array of username strings
                usernames.forEach(function(un) {
                    if(un) {
                        $scope.allUsernames.push(un.username);
                    }
                });
            },
            function(errorMsg) {
            }
        );
    };
    $scope.getAllUsernames();

}
]);