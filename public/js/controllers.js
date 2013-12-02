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
        return $scope.user && (($scope.user.siteAdmin === true) || ($scope.user.orgAdmin && $scope.user.orgAdmin.length > 0));  
    };
    
    $scope.isSiteAdmin = function() {
        return $scope.user.siteAdmin;
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

function AuthCtrl($scope, Auth, $window) {
    $scope.setActiveMenu('LOGIN');
    $scope.login = function() {
        Auth.login({
                username: $scope.username,
                password: $scope.password
            },
            function(res) {
                if (res === "OK") {
                    $window.location.href = "/";
                } else {
                    $scope.message = res;
                }
              },
            function(err) {
                $scope.message = "Failed to login";
            });
    };
}

function DEListCtrl($scope, $http, CdeList, $modal, $timeout) {
    $scope.setActiveMenu('LISTCDE');
    
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.originOptions = ['CADSR', 'FITBIR'];

    $scope.classificationSystems = ['Loading...'];
    $scope.loadTree = function() {
        return $http.get("/classificationSystems").then(function(response) {
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
    
    var onchangePromise = 0;
    $scope.onchangeSearch = function() {
        if (onchangePromise !== 0) {
            $timeout.cancel(onchangePromise);
        }
        onchangePromise = $timeout(function () {
            $scope.reload();
        }, 1000);
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
    
    $scope.openAddToForm = function (cde) {
        $modal.open({
          templateUrl: 'addToFormModalContent.html',
          controller: AddToFormModalCtrl,
          resolve: {
              cde: function() {
                  return cde;
              }
          }
        });
    };
    
    $scope.isDefaultAttachment = function (item) {
      return item.isDefault;  
    };
}

var AddToFormModalCtrl = function($scope, MyCart, $modalInstance, cde, AddCdeToForm) {
    $scope.cde = cde;
    
    MyCart.get(function(result) {
        $scope.forms = result.forms;
    });
    $scope.addToForm = function(id) {
        AddCdeToForm.add({cdeId: cde._id, formId: id});
        $modalInstance.close();
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
};

function SaveCdeCtrl($scope, $modal, $http) { 
    $scope.checkVsacId = function(cde) {
        $http({method: "GET", url: "/vsacBridge/" + cde.dataElementConcept.conceptualDomain.vsac.id}).
         error(function(data, status) {
            $scope.vsacError = "Error quering VSAC.";
            cde.dataElementConcept.conceptualDomain.vsac.id = "";
         }).
         success(function(data, status) {
            if (data === "") {
                $scope.vsacError = "Invalid VSAC OID";
                cde.dataElementConcept.conceptualDomain.vsac.id = "";
            } else {
                cde.dataElementConcept.conceptualDomain.vsac.name = data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].displayName;
                cde.dataElementConcept.conceptualDomain.vsac.version = data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['$'].version;
                cde.unsaved = true;
            }
         })
         ;
    };
    
    $scope.attachPv = function(pv) {
        var code = "null";
        for (var i = 0; i < $scope.vsacValueSet.length && code === "null"; i++) {
            if (pv.valueMeaningName === $scope.vsacValueSet[i].displayName) {
                code = $scope.vsacValueSet[i];
            }
        }
        if (code !== "null") {
            pv.valueMeaningName = code.displayName;
            pv.valueMeaningCode = code.code;
            pv.codeSystemName = code.codeSystemName;
            $scope.stageCde($scope.cde);
        }
    };
    
    $scope.removePv = function(index) {
        $scope.cde.valueDomain.permissibleValues.splice(index, 1);
        $scope.stageCde($scope.cde);
    };
    $scope.addPv = function() {
        $scope.cde.valueDomain.permissibleValues.push({permissibleValue: "Unspecified"});
    };
    
    $scope.movePvUp = function(index) {
        var pvArray = $scope.cde.valueDomain.permissibleValues;
        pvArray.splice(index - 1, 0, pvArray.splice(index, 1)[0]);    
        $scope.stageCde($scope.cde);
    };
    
    $scope.movePvDown = function(index) {
        var pvArray = $scope.cde.valueDomain.permissibleValues;
        pvArray.splice(index + 1, 0, pvArray.splice(index, 1)[0]);    
        $scope.stageCde($scope.cde);
    };
    
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

function CreateCdeCtrl($scope, $location, $timeout, DataElement, CdeList) {
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
    
    var suggestionPromise = 0;
    $scope.showSuggestions = function () {
        if (suggestionPromise !== 0) {
            $timeout.cancel(suggestionPromise);
        }
        suggestionPromise = $timeout(function () {
           var result = CdeList.get({search: JSON.stringify({name: $scope.cde.designation})}, function () {
               $scope.cdes = result.cdes;
           });
        }, 1000);
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

function DEViewCtrl($scope, $routeParams, $window, $http, DataElement, Comment, PriorCdes, CdeDiff) {
    $scope.initialized = false;
    $scope.canLinkPv = false;
    $scope.reload = function(deId, cb) {
        DataElement.get({deId: deId}, function (de) {
           $scope.cde = de;          
           $scope.loadValueSet();
           $scope.initialized = true;
           $scope.canLinkPvFunc();
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
        if ($scope.initialized && cde.archived) {
            return false;
        }
        if ($scope.user.siteAdmin) {
            return true;
        }        
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
            if (diffResult.before.version) {
                $scope.diff.version = "Before: " + diffResult.before.version + " -- After: " + diffResult.after.version
            }
            if (diffResult.before.datatype || diffResult.after.datatype) {
                $scope.diff.datatype = "Before: " + diffResult.before.datatype + " -- After: " + diffResult.after.datatype
            }
            if (diffResult.before.uom) {
                var d = dmp.diff_main(diffResult.before.uom, diffResult.after.uom);
                dmp.diff_cleanupSemantic(d);
                $scope.diff.uom = dmp.diff_prettyHtml(d);
            }
            if (diffResult.before.permissibleValues || diffResult.after.permissibleValues) {
                $scope.diff.permissibleValues = "Modified";
            }
        });
    };
    
    $scope.vsacValueSet = [];
    $scope.loadValueSet = function() {
        var dec = $scope.cde.dataElementConcept;
        if (dec != null && dec.conceptualDomain != null && dec.conceptualDomain.vsac !=  null) {
            $scope.vsacValueSet = [];
            $http({method: "GET", url: "/vsacBridge/" + dec.conceptualDomain.vsac.id}).
             error(function(data, status) {
                $scope.vsacError = "Error quering VSAC.";
                cde.dataElementConcept.conceptualDomain.vsac.id = "";
             }).
             success(function(data, status) {
                if (data === "") {
                } else {
                    for (var i = 0; i < data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'].length; i++) {
                        $scope.vsacValueSet.push(data['ns0:RetrieveValueSetResponse']['ns0:ValueSet'][0]['ns0:ConceptList'][0]['ns0:Concept'][i]['$']);
                    }
                }
             })
             ;
        }
        $scope.canLinkPvFunc();
    };
    
    // could prob. merge this into load value set.
    $scope.canLinkPvFunc = function() {
        var dec = $scope.cde.dataElementConcept;
        $scope.canLinkPv = ($scope.isAllowed($scope.cde) &&
                dec != null &&
                dec.conceptualDomain != null &&
                dec.conceptualDomain.vsac != null &&
                dec.conceptualDomain.vsac.id != null);
    };   
    
}

function FormViewCtrl($scope, $routeParams, $http, Form, DataElement, CdesInForm) {
    $scope.reload = function(formId) {
        Form.get({formId: formId}, function(form) {
            $scope.form = form;
            CdesInForm.getCdes({formId: formId}, function(cdes) {
                $scope.cdes = cdes;
                for (var k=0; k < form.modules.length; k++) {
                    for (var i = 0; i < form.modules[k].questions.length; i++) {
                        var q = form.modules[k].questions[i];
                        for (var j = 0; j < cdes.length; j++) {
                            if (cdes[j]._id === q.dataElement.de_id) {
                                q.cde = cdes[j];
                            }
                        }
                    }
                }
                for (var i = 0; i < form.questions.length; i++) {
                        var q = form.questions[i];
                        for (var j = 0; j < cdes.length; j++) {
                        if (cdes[j]._id === q.dataElement.de_id) {
                            q.cde = cdes[j];
                        }
                    }
                }
                $scope.original = $scope.form;
                if ($scope.user.siteAdmin) {
                    $scope.canEdit = true;
                } else if ($scope.myOrgs) {
                    $scope.canEdit = $scope.myOrgs.indexOf($scope.form.stewardOrg.name) > -1;
                } else {
                    $scope.canEdit = false;
                }
            });
        });
    };
    
    $scope.reload($routeParams.formId);
    
    $scope.isAllowed = function () {
        return $scope.canEdit;
    };
    
    $scope.stageForm = function() {
        $scope.form.unsaved = true;
    };
    
    $scope.revert = function() {
        $scope.reload($scope.form._id);
    };
    
    $scope.save = function() {
        $scope.form.$save();
        $scope.reload($scope.form._id);
    }; 
    
    $scope.remove = function(array, index) {
        array.splice(index, 1);
        $scope.stageForm();
    };
    
    $scope.sortUp = function(qArray, index) {
        qArray.splice(index - 1, 0, qArray.splice(index, 1)[0]);    
        $scope.stageForm();
    };
    
    $scope.sortDown = function(qArray, index) {
        qArray.splice(index + 1, 0, qArray.splice(index, 1)[0]);    
        $scope.stageForm();
    };

    $scope.sectionUp = function(index) {
        $scope.form.modules.splice(index - 1, 0, $scope.form.modules.splice(index, 1)[0]);    
        $scope.stageForm();
    };
    
    $scope.sectionDown = function(index) {
        $scope.form.modules.splice(index + 1, 0, $scope.form.modules.splice(index, 1)[0]);    
        $scope.stageForm();
    };
        
    $scope.insertSection = function(index) {
        $scope.form.modules.splice(index, 0, {name: "Untitled Section", questions: []});
    };
        
    $scope.autocomplete = function(viewValue) {
        return $http.get("/autocomplete/" + viewValue).then(function(response) { 
            return response.data;
        }); 
    }; 
    $scope.addQuestionToSection = function(newQuestion, index) {
        DataElement.get({deId: newQuestion._id}, function (de) {
            $scope.form.modules[index].questions.push({
                value: newQuestion.naming[0].designation
                , instructions: ''
                , dataElement: {de_id: newQuestion._id}
                , cde: de
            });
        });
        $scope.stageForm();
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
 
 function AttachmentsCtrl($scope, $rootScope, Attachment, DataElement) {     
    $scope.setFiles = function(element) {
        $scope.$apply(function($scope) {
          // Turn the FileList object into an Array
            $scope.files = [];
            for (var i = 0; i < element.files.length; i++) {
                if (element.files[i].size > (5 * 1024 * 1024) ) {
                    $scope.message = "Size is limited to 5Mb per attachment"; 
                } else {
                    $scope.files.push(element.files[i]);
                }
            }
          $scope.progressVisible = false;
        });
    };

    $scope.uploadFiles = function() {
        for (var i in $scope.files) {
            $scope.uploadFile($scope.files[i]);
        }
    };

    $scope.uploadFile = function(file) {
        var fd = new FormData();
        fd.append("de_id", $scope.cde._id);
        fd.append("uploadedFiles", file);
        var xhr = new XMLHttpRequest();
        xhr.upload.addEventListener("progress", uploadProgress, false);
        xhr.addEventListener("load", uploadComplete, false);
        xhr.addEventListener("error", uploadFailed, false);
        xhr.addEventListener("abort", uploadCanceled, false);
        xhr.open("POST", "/addAttachmentToCde");
        $scope.progressVisible = true;
        xhr.send(fd);
    };

    function uploadProgress(evt) {
        $scope.$apply(function(){
            if (evt.lengthComputable) {
                $scope.progress = Math.round(evt.loaded * 100 / evt.total);
            } else {
                $scope.progress = 'unable to compute';
            }
        });
    }

    function uploadComplete(evt) {
        $rootScope.$apply(function() {
            var resp = JSON.parse(evt.target.responseText);
            if (!resp.message) {
                $scope.cde = JSON.parse(evt.target.responseText);
                $scope.files = [];
                $scope.message = "";
            } else {
                $scope.message = resp.message;
            }
        });
    }

    function uploadFailed(evt) {
        // TODO
    }

    function uploadCanceled(evt) {
        $scope.$apply(function(){
            $scope.progressVisible = false;
        });
    }
    
    $scope.removeAttachment = function(index) {
        Attachment.remove({
            index: index
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
        });
    };
    
    $scope.setDefault = function(index, state) {
        if (!$scope.isAllowed($scope.cde)) {
            return;
        };
        Attachment.setDefault({
            index: index
            , state: state
            , deId: $scope.cde._id 
        }, 
        function (res) {
            $scope.cde = res;
        });
    };
 };
 
 