function MainCtrl($scope, Myself, $http, $location, $anchorScroll) {
    $scope.loadUser = function(callback) {
        Myself.get(function(u) {
            $scope.user = u;
            $scope.setMyOrgs();
            callback();
        });
    };
    
    $scope.loadUser(function(){});    
    
    $scope.isOrgCurator = function() {        
        return $scope.isOrgAdmin() || ($scope.user && ($scope.user.orgCurator && $scope.user.orgCurator.length > 0));  
    };
    
    $scope.isOrgAdmin = function() {
        return $scope.user && $scope.user.orgAdmin && $scope.user.orgAdmin.length > 0;  
    };
    
    $scope.registrationStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified', 'Standard', 'Preferred Standard'];


    $scope.setMyOrgs = function() {
        if ($scope.user && $scope.user.orgAdmin) {
            // clone orgAdmin array
            $scope.myOrgs = $scope.user.orgAdmin.slice(0);
            for (var i = 0; i < $scope.user.orgCurator.length; i++) {
                if ($scope.myOrgs.indexOf($scope.user.orgCurator[i]) < 0) {
                    $scope.myOrgs.push($scope.user.orgCurator[i]);
                }
            }
        }
    };
    
    // @TODO
    // Is there a more elegant way to do this?
    $scope.setActiveMenu = function(key) {
        $scope.menuHome = '';
        $scope.menuForm = '';
        $scope.menuLogin = '';
        $scope.menuCart = '';
        $scope.menuIntRev = '';
        $scope.menuNlmRev = '';
        $scope.menuAccount = '';
        $scope.menuCreate = '';
        if (key === 'LISTCDE') {
            $scope.menuHome = 'active';
        } else if (key === 'LOGIN') {
            $scope.menuLogin = 'active';
        } else if (key === 'LISTFORMS') {
            $scope.menuForm = 'active';
        } else if (key === 'CART') {
            $scope.menuCart = 'active';
        } else if (key === 'INTREV') {
            $scope.menuIntRev = 'active';
        } else if (key === 'NLMREV') {
            $scope.menuNlmRev = 'active';
        } else if (key === 'ACCOUNT') {
            $scope.menuAccount = 'active';
        } else if (key === 'CREATECDE') {
            $scope.menuCreate = 'active';
        }

    };
    
    $scope.listOrgs = function() {
     return $http.get("/listorgs").then(function(response){ 
        return response.data;
     });
    };
    
    $scope.orgs = $scope.listOrgs();

    $scope.scrollTo = function(id) {
        var old = $location.hash();
        $location.hash(id);
        $anchorScroll();
        //reset to old to keep any additional routing logic from kicking in
        $location.hash(old);
    };
}

function AccountManagementCtrl($scope, $http, AccountManagement) {
    $scope.setActiveMenu('ACCOUNT');
    $scope.admin = {};
    $scope.newOrg = {};
    $scope.orgAdmin = {};
    $scope.orgCurator = {};
    $scope.admin = {};
    $scope.curator = {};
        
    $scope.getSiteAdmins = function() {
        return $http.get("/siteAdmins").then(function(response) {
            return response.data;
        });
    };
    $scope.siteAdmins = $scope.getSiteAdmins();

    $scope.getOrgs = function() {
        return $http.get("/managedOrgs").then(function(response) {
            return response.data.orgs;
        });
    };
    $scope.orgs = $scope.getOrgs(); 

    $scope.getOrgAdmins = function() {
        return $http.get("/orgAdmins").then(function(response) {
            return response.data.orgs;
        });
    };
    $scope.orgAdmins = $scope.getOrgAdmins(); 

    
    $scope.getMyOrgAdmins = function() {
        return $http.get("/myOrgsAdmins").then(function(response) {
            return response.data.orgs;
        });
    };
    $scope.myOrgAdmins = $scope.getMyOrgAdmins();

    $scope.getOrgCurators = function() {
        return $http.get("/orgcurators").then(function(response) {
            return response.data.orgs;
        });
    };
    $scope.orgCurators = $scope.getOrgCurators(); 
    
    $scope.addSiteAdmin = function() {
        AccountManagement.addSiteAdmin({
            username: $scope.admin.username
            },
            function(res) {
                  $scope.message = res;
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
                  $scope.message = res;
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
                  $scope.message = res;
                  $scope.orgAdmins = $scope.getOrgAdmins();
                  $scope.myOrgAdmins = $scope.getMyOrgAdmins();
            }
        );
        $scope.orgAdmin.username = "";
    };

    $scope.removeOrgAdmin = function(orgName, userId) {
        AccountManagement.removeOrgAdmin({
            orgName: orgName
            , userId: userId
            },
            function (res) {
                $scope.message = res;
                $scope.orgAdmins = $scope.getOrgAdmins();
                $scope.myOrgAdmins = $scope.getMyOrgAdmins();
            }
        
        );
    };

    $scope.addOrgCurator = function() {
        AccountManagement.addOrgCurator({
            username: $scope.orgCurator.username
            , org: $scope.curator.orgName
            },
            function(res) {
                  $scope.message = res;
                  $scope.orgCurators = $scope.getOrgCurators(); 
            }
        );
        $scope.orgCurator.username = "";
    };
        
    $scope.removeOrgCurator = function(orgName, userId) {
        AccountManagement.removeOrgCurator({
            orgName: orgName
            , userId: userId
            },
            function (res) {
                $scope.message = res;
                $scope.orgCurators = $scope.getOrgCurators(); 
            }
        
        );
    };

    $scope.addOrg = function() {
        AccountManagement.addOrg({
            name: $scope.newOrg.name
            },
            function(res) {
                  $scope.message = res;
                  $scope.orgs = $scope.getOrgs();
            }
        );
        $scope.newOrg.name = "";
    };

    $scope.removeOrg = function(byId) {
       AccountManagement.removeOrg({
            id: byId
            },
            function(res) {
                  $scope.message = res;
                  $scope.orgs = $scope.getOrgs();
            }
        );
    };     
}

function AuthCtrl($scope, $rootScope, Auth, $location) {
    $scope.setActiveMenu('LOGIN');
    $scope.login = function() {
        Auth.login({
                username: $scope.username,
                password: $scope.password
            },
            function(res) {
                $rootScope.user = res;
                $location.path('/');
            },
            function(err) {
                $rootScope.error = "Failed to login";
            });
    };
    
    $scope.register = function() {
        Auth.register({
            username: $scope.user.username
            , password: $scope.user.password
        },
        function(res) {
            $rootScope.message = res;
            $location.path("/login");
        },
        function(err) {
            $rootScope.error = "failed";
        }
    );
    };
}

function DEListCtrl($scope, $http, CdeList, $modal) {
    $scope.setActiveMenu('LISTCDE');
    
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.originOptions = ['CADSR', 'FITBIR'];

    $scope.classificationTree = [{label: "loading", children: ['loading']}];
    $scope.loadTree = function() {
        return $http.get("/classificationtree").then(function(response) {
            $scope.classificationTree = response.data;
        });
    };
    $scope.loadTree();
    
    // this one ensures that we don't send this as query when none is selected. 
    $scope.removeOwningOrg = function() {
        if ($scope.search.stewardOrg.name == "") {
            delete $scope.search.stewardOrg;
        }
    };
    $scope.removeRegistrationStatus = function() {
        if (!$scope.search.registrationState || !$scope.search.registrationState.registrationStatus) {
            delete $scope.search.registrationState;
        }
    };
    $scope.removeClassificationSystem = function() {
        if ($scope.search.classificationSystem == "") {
            delete $scope.search.classificationSystem;
        }
    };
   
    $scope.$watch('currentPage', function() {
        $scope.reload();
    });

    $scope.setPage = function (pageNo) {
      $scope.currentPage = pageNo;
    };       

    $scope.previous = function () {
        $scope.currentPage--;
    };

    $scope.next = function () {
        $scope.currentPage++;
    };
    
    $scope.reload = function() {
        var newfrom = ($scope.currentPage - 1) * $scope.pageSize;
        var result = CdeList.get({from: newfrom, search: JSON.stringify($scope.search)}, function () {
           $scope.numPages = result.pages; 
           $scope.cdes = result.cdes;
           $scope.totalItems = result.totalNumber;
        });
    } ;  
    
    $scope.autocomplete = function(viewValue) {
        // @TODO
        // Typeahead gets called before ng-model binding 
        // So I am setting is manually. Is there a better way to do the next 3 lines?
        if (!$scope.search) {
            $scope.search = {};
        }
        $scope.search.name = viewValue;
        
        return $http.get("/autocomplete?search="+JSON.stringify($scope.search)).then(function(response){ 
            return response.data.names;
        }); 
    };
    
    $scope.isAllowed = function (cde) {
        return false;
    };
}

function SaveCdeCtrl($scope, $modal) {
    $scope.stageCde = function(cde) {
        cde.unsaved = true;
    };
    
    $scope.openRegStatusUpdate = function () {
        var modalInstance = $modal.open({
          templateUrl: 'regStatusUpdate.html',
          controller: SaveCdeModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.cde;
              }
          }
        });

        modalInstance.result.then(function () {
        }, function () {
        });        
    };
    
    $scope.openSave = function () {
        $modal.open({
          templateUrl: 'saveCdeModalContent.html',
          controller: SaveCdeModalCtrl,
          resolve: {
              cde: function() {
                  return $scope.cde;
              }
          }
        });
    };
};

var SaveCdeModalCtrl = function ($scope, $window, $modalInstance, cde) {
  $scope.cde = cde;

  $scope.stewardRegStatuses = ['Incomplete', 'Candidate', 'Recorded', 'Qualified'];

  $scope.ok = function () {
    $scope.cde.$save(function (cde) {
        $window.location.href = "/#/deview?cdeId=" + cde._id;
    });
    $modalInstance.close();
  };

  $scope.cancelSave = function () {
    $modalInstance.dismiss('cancel');
  };
};

function LinkVsacCtrl($scope, LinkToVsac) {    
    $scope.linktovsac = function(cde, vsId) {
        LinkToVsac.link({cde_id: cde._id, vs_id: vsId}, function(dataElement) {
           var ind = $scope.cdes.indexOf(cde);
           $scope.cdes[ind] = dataElement;
       });
    };
}

function AddToFormCtrl($scope, MyCart, AddCdeToForm) {
    $scope.radioModel = {
        id: 0
    };
    $scope.openModal = function() {
        MyCart.get(function(result) {
            $scope.forms = result.forms;
            $scope.showModal = true;
        });          
    };   
    $scope.closeModal = function() {
        $scope.showModal = false;
    };
    $scope.addToForm = function(cdeId) {
        AddCdeToForm.add({cdeId: cdeId, formId: $scope.radioModel.id});
        $scope.closeModal();
    };
}

var HistoryModalCtrl = function ($scope, $modalInstance, PriorCdes, cdeId) {
    PriorCdes.getCdes({cdeId: cdeId}, function(dataElements) {
       $scope.priorCdes = dataElements;
   });    
    
  $scope.ok = function () {
    $modalInstance.close();
  };

};

function AuditCtrl($scope) {
    $scope.openHistory = function () {
        var modalInstance = $modal.open({
          templateUrl: 'saveCdeModalContent.html',
          controller: SaveCdeModalCtrl,
          resolve: {
              cdeId: function() {
                  return $scope.cde_id;
              }
          }
        });

        modalInstance.result.then(function () { 
        }, function () {
        });
    };
    
}

function EditCtrl($scope, $location, $routeParams, DataElement) {
    var self = this;

    DataElement.get({cdeId: $routeParams.cdeId}, function(dataElement) {
        self.original = dataElement;
        $scope.dataElement = new DataElement(self.original);
    });
 
    $scope.isClean = function() {
        return angular.equals(self.original, $scope.dataElement);
    };
    
    $scope.save = function() {
        $scope.dataElement.$update({cdeId: $scope.dataElement._id});
        $location.path('/');
   };  
}

function CreateCdeCtrl($scope, $location, DataElement) {
    $scope.setActiveMenu('CREATECDE');

    $scope.save = function() {
        // !TODO probably not the best way to do this
        $scope.cde.naming = [];
        $scope.cde.naming.push({
           designation: $scope.cde.designation
           , definition: $scope.cde.definition
           , context: {
               contextName: "Health"
               , acceptability: "preferred"
           }
        });
        delete $scope.cde.designation;
        delete $scope.cde.definition;
        
        DataElement.save($scope.cde, function(cde) {
            $location.path('#/');        
        });
    };
}

function ListFormsCtrl($scope, FormList, AddToCart, RemoveFromCart, $http) {
    $scope.currentPage = 1;
    $scope.pageSize = 10;

    $scope.setActiveMenu('LISTFORMS');
    $scope.forms = [];
    
    $scope.addToCart = function(form) {
       AddToCart.add({formId: form._id}, function(form) {
           $scope.loadUser(function(){});
       });
    };

    $scope.removeFromCart = function(form) {
       RemoveFromCart.add({formId: form._id}, function(form) {
           $scope.loadUser(function(){});
       });
    };
    
    $scope.isInCart = function(formId) {
        if ($scope.user.formCart) {
            return $scope.user.formCart.indexOf(formId) > -1;
        } else {
            return false;
        }
    };
    
    $scope.autocomplete = function(viewValue) {
        // @TODO
        // Typeahead gets called before ng-model binding 
        // So I am setting is manually. Is there a better way to do the next 3 lines?
        if (!$scope.search) {
            $scope.search = {};
        }
        $scope.search.name = viewValue;
        
        return $http.get("/autocomplete/form/?search="+JSON.stringify($scope.search)).then(function(response) { 
            return response.data.names;
        }); 
    };
    
    $scope.$watch('currentPage', function() {
        $scope.reload();
    });

    $scope.setPage = function (pageNo) {
      $scope.currentPage = pageNo;
    };       

    $scope.previous = function () {
        $scope.currentPage--;
    };

    $scope.next = function () {
        $scope.currentPage++;
    };
    
    $scope.reload = function() {
        var newfrom = ($scope.currentPage - 1) * $scope.pageSize;
        var result = FormList.get({from: newfrom, search: JSON.stringify($scope.search)}, function () {
           $scope.numPages = result.pages; 
           $scope.forms = result.forms;
        });
    } ;  
    
}

function DEViewCtrl($scope, $routeParams, $q, $window, DataElement, Comment, PriorCdes, CdeDiff) {
    $scope.initialized = false;
    $scope.reload = function(deId) {
        DataElement.get({deId: deId}, function (de) {
           $scope.cde = de; 
           $scope.initialized = true;
        });
        
        PriorCdes.getCdes({cdeId: deId}, function(dataElements) {
            $scope.priorCdes = dataElements;
        }); 
        
    };
    
    $scope.reload($routeParams.cdeId);

    var indexedConceptSystemClassifications = [];
    $scope.classificationToFilter = function() {
         indexedConceptSystemClassifications = [];
         if ($scope.cde != null) {
             return $scope.cde.classification;
         } 
    };
    
    $scope.filterConceptSystemClassification = function(item) {
      var systemIsNew = indexedConceptSystemClassifications.indexOf(item.conceptSystem) == -1;
      if (systemIsNew) {
          indexedConceptSystemClassifications.push(item.conceptSystem);
      }
      return systemIsNew;
    };
    
    $scope.isInConceptSystem = function(system) {
        return function(classi) {
            return classi.conceptSystem === system;
        };
    };

    $scope.comment = {};

    $scope.addComment = function() {        
        Comment.addComment({
            comment: $scope.comment.content
            , deId: $scope.cde._id
            },
            function(res) {
                  $scope.message = res;
                  $scope.reload($scope.cde._id);
            }
        );
        $scope.comment.content = "";
    };
    
    $scope.removeComment = function(commentId) {
        Comment.removeComment({
            commentId: commentId
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.message = res;
            $scope.reload($scope.cde._id);
        });
    };
    
    $scope.isAllowed = function (cde) {
        if ($scope.initialized && $scope.myOrgs) {
            return $scope.myOrgs.indexOf(cde.stewardOrg.name) > -1;
        } else {
            return false;
        }
    };
   
    $scope.save = function() {
        $scope.cde.$save(function (cde) {
            $window.location.href = "/#/deview?cdeId=" + cde._id;
        });
    }; 
    
    $scope.revert = function(cde) {
        $scope.reload(cde._id);
    };
    
    $scope.viewDiff = function (cde) {
        var dmp = new diff_match_patch();
        
        CdeDiff.get({deId: cde._id}, function(diffResult) {
            $scope.diff = {};
            if (diffResult.before.name) {
                var d = dmp.diff_main(diffResult.before.name, diffResult.after.name);
                dmp.diff_cleanupSemantic(d);
                $scope.diff.name = dmp.diff_prettyHtml(d);
            }
            if (diffResult.before.definition) {
                var d = dmp.diff_main(diffResult.before.definition, diffResult.after.definition);
                dmp.diff_cleanupSemantic(d);
                $scope.diff.definition = dmp.diff_prettyHtml(d);
            }
        });
    };
    
}

function FormViewCtrl($scope, $routeParams, Form, CdesInForm) {
    $scope.reload = function(formId) {
        Form.get({formId: formId}, function(form) {
            $scope.form = form;
            CdesInForm.getCdes({formId: formId}, function(cdes) {
                $scope.cdes = cdes;
                for (var k=0; k < form.modules.length; k++) {
                    for (var i = 0; i < form.modules[k].questions.length; i++) {
                        var q = form.modules[k].questions[i];
                        for (var j = 0; j < cdes.length; j++) {
                            if (cdes[j].uuid === q.dataElement.de_uuid) {
                                q.cde = cdes[j];
                            }
                        }
                    }
                }
                $scope.original = $scope.form;
            });
            if ($scope.user && $scope.user.orgAdmin) {
                $scope.canEdit = $scope.user.orgAdmin.indexOf(form.stewardOrg.name) > -1;
            } else {
                $scope.canEdit = false;
            }
        });
    };
    
    $scope.reload($routeParams.formId);
    
    $scope.isAllowed = function () {
        return $scope.canEdit;
    };
    
    $scope.stageQuestion = function() {
        $scope.form.unsaved = true;
    };
    
    $scope.revert = function() {
        $scope.reload($scope.form._id);
    };
    
    $scope.save = function() {
        $scope.form.$save();
        $scope.reload($scope.form._id);
    }; 
    
    $scope.sortUp = function(index) {
        var qArray = $scope.form.questions;
        qArray.splice(index - 1, 0, qArray.splice(index, 1)[0]);    
        $scope.stageQuestion();
    };
    
    $scope.sortDown = function(index) {
        var qArray = $scope.form.questions;
        qArray.splice(index + 1, 0, qArray.splice(index, 1)[0]);    
        $scope.stageQuestion();
    };
};

function CartCtrl($scope, MyCart, RemoveFromCart) {
    $scope.setActiveMenu('CART');
    
    $scope.loadForms = function() {
      MyCart.get(function(result) {
        $scope.forms = result.forms;
      });  
    };
    
    $scope.loadForms();

    $scope.isInCart = function(formId) {
        if ($scope.user.formCart) {
            return $scope.user.formCart.indexOf(formId) > -1;
        } else {
            return false;
        }
    };

    $scope.removeFromCart = function(form) {
       RemoveFromCart.add({formId: form._id}, function(form) {
           $scope.loadUser(function() {
               $scope.loadForms();
           });
       });
    };
    
}

function CreateFormCtrl($scope, $location, Form) {
    $scope.save = function() {
        Form.save($scope.form, function(form) {
            $location.path('#/listforms');        
        });
    };
 }
 
 function RegistrationCtrl($scope, DataElement) {
    $scope.changeStatus = function(cde, status) {
        DataElement.get({cdeId: cde._id}, function(dataElement) {
            dataElement.registrationState.registrationStatus = status;
            dataElement.$save(function () {
                $scope.reload();            
            });
        }); 
    };     
 }
 