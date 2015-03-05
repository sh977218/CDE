angular.module('systemModule').controller('AccountManagementCtrl', ['$scope', '$http', '$timeout', '$window', 'AccountManagement', 'userResource', function($scope, $http, $timeout, $window, AccountManagement, userResource) {
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
    
    function resetOrgAdminForm() {
        $scope.orgAdmin.username = "";
        $scope.admin = {};
    }
    
    function resetOrgCuratorForm() {
        $scope.orgCurator.username = "";
        $scope.curator = {};
    }
    
    $http.get("/systemAlert").then(function(response) {
       $scope.broadcast = {message: response.data}; 
    });
        
    $scope.getSiteAdmins = function() {
        return $http.get("/siteAdmins").then(function(response) {
            $scope.siteAdmins = response.data;
        });
    };
    $scope.getSiteAdmins();

    $scope.getOrgs = function() {
        return $http.get("/managedOrgs").then(function(response) {
            $scope.orgs = response.data.orgs;
            $scope.orgNames = $scope.orgs.map(function(o) {return o.name;});
        });
    };
    $scope.getOrgs(); 
    
    // Retrieve all orgs and users who are admins of each org
    $scope.getOrgAdmins = function() {
        return $http.get("/orgAdmins").then(function(response) {
            $scope.orgAdmins = response.data.orgs;
        });
    };
    $scope.getOrgAdmins(); 
    
    // Retrieve orgs user is admin of
    $scope.getMyOrgAdmins = function() {
        return $http.get("/myOrgsAdmins").then(function(response) {
            $scope.myOrgAdmins = response.data.orgs;
        });
    };
    $scope.getMyOrgAdmins();
    
    // Retrieve orgs user is curator of
    $scope.getOrgCurators = function() {
        return $http.get("/orgcurators").then(function(response) {
            $scope.orgCurators = response.data.orgs;
        });
    };
    $scope.getOrgCurators(); 
    
    $scope.addSiteAdmin = function() {
        AccountManagement.addSiteAdmin({
            username: $scope.admin.username
            },
            function(res) {
                  $scope.addAlert("success", res);
                  $scope.siteAdmins = $scope.getSiteAdmins();
            }
        );
        $scope.admin.username = "";
    };
    
    $scope.removeSiteAdmin = function(byId) {
       AccountManagement.removeSiteAdmin({
            id: byId
            },
            function(res) {
                  $scope.addAlert("success", res);
                  $scope.siteAdmins = $scope.getSiteAdmins();
            }
        );
    };
    
    $scope.addOrgAdmin = function() {
        AccountManagement.addOrgAdmin({
            username: $scope.orgAdmin.username
            , org: $scope.admin.orgName
            },
            function(res) {
                  $scope.addAlert("success", res);
                  $scope.orgAdmins = $scope.getOrgAdmins();
                  $scope.myOrgAdmins = $scope.getMyOrgAdmins();
            }
        );
        resetOrgAdminForm();
    };

    $scope.removeOrgAdmin = function(orgName, userId) {
        if (userResource.user._id === userId) {
            var answer = confirm("Please confirm that you want to remove yourself from the list of admins. You will be redirected to the home page. ");
            if (!answer) {
                return;
            }            
        }
        AccountManagement.removeOrgAdmin({
            orgName: orgName
            , userId: userId
            },
            function (res) {
                $scope.addAlert("success", res);
                $scope.orgAdmins = $scope.getOrgAdmins();
                $scope.myOrgAdmins = $scope.getMyOrgAdmins();
                
                if (userResource.user._id === userId) {
                    $window.location.href = "/";
                }
            }        
        );
    };

    $scope.addOrgCurator = function() {
        AccountManagement.addOrgCurator({
            username: $scope.orgCurator.username
            , org: $scope.curator.orgName
            },
            function(res) {
                  $scope.addAlert("success", res);
                  $scope.orgCurators = $scope.getOrgCurators(); 
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
                $scope.addAlert("success", res);
                $scope.orgCurators = $scope.getOrgCurators(); 
            }
        
        );
    };

    $scope.addOrg = function() {
        AccountManagement.addOrg(
            {name:$scope.newOrg.name, longName:$scope.newOrg.longName, workingGroupOf:$scope.newOrg.workingGroupOf}
            , function(res) {
                $scope.addAlert("success", res);
                $scope.orgs = $scope.getOrgs();
            }
        );
        $scope.newOrg = {};
    };

    $scope.removeOrg = function(byId) {
       AccountManagement.removeOrg({
            id: byId
            },
            function(res) {
                $scope.addAlert("success", res);
                $scope.orgs = $scope.getOrgs();
            }
        );
    };
    
    $scope.updateOrg = function(c) {
        $timeout(function(){
            AccountManagement.updateOrg(c,
                function(res) {
                    $scope.addAlert("success", res);
                    $scope.orgs = $scope.getOrgs();
                },
                function(res) {
                    $scope.addAlert("danger", res);
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
                $scope.addAlert("success", successMsg);
                resetTransferStewardObj();
            },
            function(errorMsg) {
                $scope.addAlert("danger", errorMsg);
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