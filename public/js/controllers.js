function MainCtrl($scope, Myself, $http, $location, $anchorScroll) {
    $scope.loadUser = function(callback) {
        Myself.get(function(u) {
            $scope.user = u; 
            callback();
        });
    };
    
    $scope.loadUser(function(){});  
    
    $scope.modalOpts = {
        backdropFade: true,
        dialogFade: true
    };  
    
    $scope.isContextAdmin = function() {
        return $scope.user && $scope.user.contextAdmin && $scope.user.contextAdmin.length > 0;  
    };
    
    $scope.workflowStatuses = ['Draft', 'Internal Review', 'Internally Reviewed', 'Submitted', 'Released'];
    
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
        }

    };
    
    $scope.listcontexts = function() {
     return $http.get("/listcontexts").then(function(response){ 
        return response.data;
     });
    };
    
    $scope.contexts = $scope.listcontexts();

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
        
    $scope.getNlmAdmins = function() {
        return $http.get("/nlmAdmins").then(function(response) {
            return response.data;
        });
    };
    $scope.nlmAdmins = $scope.getNlmAdmins();

    $scope.getContexts = function() {
        return $http.get("/managedContexts").then(function(response) {
            return response.data.contexts;
        });
    };
    $scope.contexts = $scope.getContexts(); 

    $scope.getContextAdmins = function() {
        return $http.get("/contextAdmins").then(function(response) {
            return response.data.contexts;
        });
    };
    $scope.contextAdmins = $scope.getContextAdmins(); 
    
    $scope.addNlmAdmin = function() {
        AccountManagement.addNlmAdmin({
            username: $scope.adminUsername
            },
            function(res) {
                  $scope.message = res;
                  $scope.nlmAdmins = $scope.getNlmAdmins();
            }
        );
        $scope.adminUsername = "";
    };
    
    $scope.removeNlmAdmin = function(byId) {
       AccountManagement.removeNlmAdmin({
            id: byId
            },
            function(res) {
                  $scope.message = res;
                  $scope.nlmAdmins = $scope.getNlmAdmins();
            }
        );
    };
    
    $scope.addContextAdmin = function() {
        AccountManagement.addContextAdmin({
            username: $scope.contextAdminUsername
            , context: $scope.adminContextName
            },
            function(res) {
                  $scope.message = res;
                  $scope.contextAdmins = $scope.getContextAdmins();
            }
        );
        $scope.contextAdminUsername = "";
    };

    $scope.removeContextAdmin = function(contextName, userId) {
        AccountManagement.removeContextAdmin({
            contextName: contextName
            , userId: userId
            },
            function (res) {
                $scope.message = res;
                $scope.contextAdmins = $scope.getContextAdmins();
            }
        
        );
    };
    
    $scope.addContext = function() {
        AccountManagement.addContext({
            name: $scope.contextName
            },
            function(res) {
                  $scope.message = res;
                  $scope.contexts = $scope.getContexts();
            }
        );
        $scope.contextName = "";
    };

    $scope.removeContext = function(byId) {
       AccountManagement.removeContext({
            id: byId
            },
            function(res) {
                  $scope.message = res;
                  $scope.contexts = $scope.getContexts();
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
                console.log(res);
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
    )};
}

function ListCtrl($scope, $http, CdeList, DataElement, AutocompleteSvc) {
    $scope.setActiveMenu('LISTCDE');
    
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.originOptions = ['CADSR', 'FITBIR'];

    $scope.removeOwningContext = function() {
        if ($scope.search.owningContext == "") {
            delete $scope.search.owningContext;
        }
    };
    $scope.removeWorkflowStatus = function() {
        if (!$scope.search.workflowStatus) {
            delete $scope.search.workflowStatus;
        }
    };
    
    $scope.isAllowed = function (cde) {
        if ($scope.user.contextAdmin) {
            return $scope.user.contextAdmin.indexOf(cde.owningContext) > -1;
        } else {
            return false;
        }
    };
    
    $scope.stageCde = function(cde) {
        cde.unsaved = true;
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
    
    $scope.revert = function(cde) {
        var de = DataElement.get({cdeId: cde._id}, function(dataElement) {
           var ind = $scope.cdes.indexOf(cde);
           $scope.cdes[ind] = dataElement;
        });
    };
    
    $scope.save = function(cde) {
        // @TODO 
        // This is prob a lame way to do it. 
        // Check save form.
        var de = DataElement.get({cdeId: cde._id}, function(dataElement) {
            de.name = cde.name;
            de.definition = cde.definition;
            de.changeNote = cde.changeNote;
            de.$save();
            cde.unsaved = false;
            var ind = $scope.cdes.indexOf(cde);
            $scope.cdes[ind] = dataElement;
            console.log(dataElement.updated);
        });
    };  
}

function SaveCtrl($scope) {    
    $scope.openSave = function() {
        $scope.showSave = true;
    };   
    $scope.cancelSave = function() {
        $scope.showSave = false;
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
        var result = MyCart.get(function(result) {
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

function AuditCtrl($scope, PriorCdes) {
    $scope.openHistory = function() {
        PriorCdes.getCdes({cdeId: $scope.cde._id}, function(dataElements) {
            $scope.priorCdes = dataElements;
            $scope.showHistory = true;
        });        
    };   
    $scope.closeHistory = function() {
        $scope.showHistory = false;
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

function CreateCtrl($scope, $location, DataElement) {
    $scope.save = function() {
        DataElement.save($scope.dataElement, function(dataElement) {
            $location.path('/edit/' + dataElement._id);
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

function DEViewCtrl($scope, $routeParams, DataElement) {
    $scope.reload = function(deId) {
        DataElement.get({deId: deId}, function (de) {
           $scope.cde = de; 
        });
    };
    
    $scope.reload($routeParams.cdeId);
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
            if ($scope.user && $scope.user.contextAdmin) {
                $scope.canEdit = $scope.user.contextAdmin.indexOf(form.owningContext) > -1;
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
 
 function WorkflowCtrl($scope, DataElement) {
    $scope.changeStatus = function(cde, status) {
        DataElement.get({cdeId: cde._id}, function(dataElement) {
            dataElement.workflowStatus = status;
            dataElement.$save(function () {
                $scope.reload();            
            });
        }); 
    };     
 }
 
function NlmReleaseCtrl($scope, CdeList, DataElement) {
    $scope.setActiveMenu('NLMREV');
    
    $scope.changeStatus = function(cde, status) {
        DataElement.get({cdeId: cde._id}, function(dataElement) {
            dataElement.workflowStatus = status;
            dataElement.$save(function () {
                $scope.reload();            
            });
        }); 
    };
    $scope.reject = function(cde) {
        $scope.changeStatus(cde, 'Draft');
    };
    
    $scope.approve = function(cde) {
        $scope.changeStatus(cde, 'Released');
    };
    
    $scope.reload = function() {
       var result = CdeList.get({search: JSON.stringify({workflowStatus: 'Submitted'})}, function() {
           $scope.cdes = result.cdes;
        }); 
    };
    
    $scope.reload();
}

function InternalReviewCtrl($scope, CdesForApproval, DataElement) {
   $scope.setActiveMenu('INTREV');
   
    $scope.changeStatus = function(cde, status) {
        DataElement.get({cdeId: cde._id}, function(dataElement) {
            dataElement.workflowStatus = status;
            dataElement.$save(function () {
                $scope.reload();            
            });
        }); 
    };
    $scope.reject = function(cde) {
        $scope.changeStatus(cde, 'Draft');
    };
    
    $scope.approve = function(cde) {
        $scope.changeStatus(cde, 'Internally Reviewed');
    };
    
    $scope.reload = function() {
       var result = CdesForApproval.get({}, function() {
           $scope.cdes = result.cdes;
       }); 
    };
    
    $scope.reload();
}