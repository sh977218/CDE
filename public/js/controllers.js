function MainCtrl($scope, Myself, $http, $location, $anchorScroll) {
    $scope.loadUser = function(callback) {
        Myself.get(function(u) {
            $scope.user = u;
            $scope.setMyContexts();
            callback();
        });
    };
    
    $scope.loadUser(function(){});  
    
    $scope.modalOpts = {
        backdropFade: true,
        dialogFade: true
    };  
    
    $scope.isContextCurator = function() {        
        return $scope.isContextAdmin() || ($scope.user && ($scope.user.contextCurator && $scope.user.contextCurator.length > 0));  
    };
    
    $scope.isContextAdmin = function() {
        return $scope.user && $scope.user.contextAdmin && $scope.user.contextAdmin.length > 0;  
    };
    
    $scope.workflowStatuses = ['Draft', 'Internal Review', 'Internally Reviewed', 'Submitted', 'Released'];

    $scope.setMyContexts = function() {
        if ($scope.user) {
            // clone contextAdmin array
            $scope.myContexts = $scope.user.contextAdmin.slice(0);
            for (var i = 0; i < $scope.user.contextCurator.length; i++) {
                if ($scope.myContexts.indexOf($scope.user.contextCurator[i]) < 0) {
                    $scope.myContexts.push($scope.user.contextCurator[i]);
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

function ContextAccountManagementCtrl($scope, $http) {

    $scope.getContextAdmins = function() {
        return $http.get("/myContextsAdmins").then(function(response) {
            return response.data.contexts;
        });
    };

}

function AccountManagementCtrl($scope, $http, AccountManagement) {
    $scope.setActiveMenu('ACCOUNT');
    $scope.admin = {};
    $scope.newContext = {};
    $scope.contextAdmin = {};
    $scope.contextCurator = {};
    $scope.admin = {};
    $scope.curator = {};
        
    $scope.getSiteAdmins = function() {
        return $http.get("/siteAdmins").then(function(response) {
            return response.data;
        });
    };
    $scope.siteAdmins = $scope.getSiteAdmins();

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

    $scope.getContextCurators = function() {
        return $http.get("/contextcurators").then(function(response) {
            return response.data.contexts;
        });
    };
    $scope.contextCurators = $scope.getContextCurators(); 
    
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
    
    $scope.addContextAdmin = function() {
        AccountManagement.addContextAdmin({
            username: $scope.contextAdmin.username
            , context: $scope.admin.contextName
            },
            function(res) {
                  $scope.message = res;
                  $scope.contextAdmins = $scope.getContextAdmins();
            }
        );
        $scope.contextAdmin.username = "";
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

    $scope.addContextCurator = function() {
        AccountManagement.addContextCurator({
            username: $scope.contextCurator.username
            , context: $scope.curator.contextName
            },
            function(res) {
                  $scope.message = res;
                  $scope.contextCurators = $scope.getContextCurators(); 
            }
        );
        $scope.contextCurator.username = "";
    };
        
    $scope.removeContextCurator = function(contextName, userId) {
        AccountManagement.removeContextCurator({
            contextName: contextName
            , userId: userId
            },
            function (res) {
                $scope.message = res;
                $scope.contextCurators = $scope.getContextCurators(); 
            }
        
        );
    };

    $scope.addContext = function() {
        AccountManagement.addContext({
            name: $scope.newContext.name
            },
            function(res) {
                  $scope.message = res;
                  $scope.contexts = $scope.getContexts();
            }
        );
        $scope.newContext.name = "";
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
    );
    };
}

function DEListCtrl($scope, $http, CdeList, DataElement, AutocompleteSvc) {
    $scope.setActiveMenu('LISTCDE');
    
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.originOptions = ['CADSR', 'FITBIR'];

    // this one ensures that we don't send this as query when none is selected. 
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
    
    $scope.isAllowed = function (cde) {
        return false;
    };

}

function SaveCdeCtrl($scope, DataElement) {

    $scope.stageCde = function(cde) {
        cde.unsaved = true;
    };
    
    
//    $scope.save = function(cde) {
//        // @TODO 
//        // This is prob a lame way to do it. 
//        // Check save form.
//        var de = DataElement.get({cdeId: cde._id}, function(dataElement) {
//            de.name = cde.name;
//            de.definition = cde.definition;
//            de.changeNote = cde.changeNote;
//            de.$save();
//            cde.unsaved = false;
//            var ind = $scope.cdes.indexOf(cde);
//            $scope.cdes[ind] = dataElement;
//            console.log(dataElement.updated);
//        });
//    };  
    
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

function CreateCdeCtrl($scope, $location, DataElement) {
    $scope.setActiveMenu('CREATECDE');

    $scope.save = function() {
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

function DEViewCtrl($scope, $routeParams, $location, $window, DataElement, Comment, PriorCdes, CdeDiff) {
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
        if ($scope.initialized && $scope.myContexts) {
            return $scope.myContexts.indexOf(cde.owningContext) > -1;
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