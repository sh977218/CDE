function AuthCtrl($scope, Auth, Myself) {
    var u = Myself.get(function(u) {
        $scope.user = u; 
    });
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
}

function ListCtrl($scope, $http, CdeList, DataElement, Myself) {
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    
    $scope.originOptions = ['CADSR', 'FITBIR'];

    Myself.get(function(u) {
        $scope.user = u; 
    });
    
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
   
    $scope.listcontexts = function() {
     return $http.get("/listcontexts").then(function(response){ 
        return response.data;
     });
    };
    
    $scope.contexts = $scope.listcontexts();

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
     return $http.get("/autocomplete/"+viewValue).then(function(response){ 
        return response.data;
     });
    };
    
    $scope.revert = function(cde) {
        var de = DataElement.get({cdeId: cde._id}, function(dataElement) {
           var ind = $scope.cdes.indexOf(cde);
           $scope.cdes[ind] = dataElement;
        });
    };
    
    $scope.save = function(cde) {
        var de = DataElement.get({cdeId: cde._id}, function(dataElement) {
            de.longName = cde.longName;
            de.preferredDefinition = cde.preferredDefinition;
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
    $scope.saveOpts = {
        backdropFade: true,
        dialogFade: true
    };  
};

function LinkVsacCtrl($scope, LinkToVsac) {    
    $scope.linktovsac = function(cde, vsId) {
        LinkToVsac.link({cde_id: cde._id, vs_id: vsId}, function(dataElement) {
           var ind = $scope.cdes.indexOf(cde);
           $scope.cdes[ind] = dataElement;
       });
    };
    
    $scope.modalOpts = {
        backdropFade: true,
        dialogFade: true
    }; 
}

function AddToFormCtrl($scope, Myself, MyCart, AddCdeToForm) {
    $scope.radioModel = {
        id: 0
    };
    $scope.openModal = function() {
        var u = Myself.get(function(u) {
            $scope.user = u; 
            var result = MyCart.get(function(result) {
                $scope.forms = result.forms;
                $scope.showModal = true;
            });          
        }); 
    };   
    $scope.closeModal = function() {
        $scope.showModal = false;
    };
    $scope.modalOpts = {
        backdropFade: true,
        dialogFade: true
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
    $scope.historyOpts = {
        backdropFade: true,
        dialogFade: true
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

function ListFormsCtrl($scope, FormList, AddToCart, RemoveFromCart, Myself) {
    $scope.loadUser = function() {
        Myself.get(function(u) {
            $scope.user = u; 
        });
    };
    
    $scope.loadUser();
    
    $scope.forms = [];
    var result = FormList.get({}, function() {
        $scope.forms = result.forms;
    });
    
    $scope.addToCart = function(form) {
       AddToCart.add({formId: form._id}, function(form) {
           $scope.loadUser();
       });
    };

    $scope.removeFromCart = function(form) {
       RemoveFromCart.add({formId: form._id}, function(form) {
           $scope.loadUser();
       });
    };
    
    $scope.isInCart = function(formId) {
        if ($scope.user.formCart) {
            return $scope.user.formCart.indexOf(formId) > -1;
        } else {
            return false;
        }
    };
}

function FormViewCtrl($scope, $routeParams, Form, CdesInForm, Myself) {
    Myself.get(function(u) {
        $scope.user = u; 
    });
      
    $scope.reload = function(formId) {
        Form.get({formId: formId}, function(form) {
            $scope.form = form;
            CdesInForm.getCdes({formId: formId}, function(cdes) {
                $scope.cdes = cdes;
                for (var i = 0; i < form.questions.length; i++) {
                    var q = form.questions[i];
                    for (var j = 0; j < cdes.length; j++) {
                        if (cdes[j].uuid === q.cde_uuid) {
                            q.cde = cdes[j];
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

function CartCtrl($scope, Myself, MyCart, RemoveFromCart) {
    $scope.loadUser = function() {
        var u = Myself.get(function(u) {
            $scope.user = u; 
            $scope.loadForms();
        });
    };

    $scope.loadForms = function() {
      MyCart.get(function(result) {
        $scope.forms = result.forms;
      });  
    };

    $scope.isInCart = function(formId) {
        if ($scope.user.formCart) {
            return $scope.user.formCart.indexOf(formId) > -1;
        } else {
            return false;
        }
    };

    $scope.removeFromCart = function(form) {
       RemoveFromCart.add({formId: form._id}, function(form) {
           $scope.loadUser();
       });
    };

    $scope.loadUser();
}

function CreateFormCtrl($scope, $location, Form) {
    $scope.userGroups = [];
    
    $scope.initGroups = function(groups) {
        for (var i in groups) {
            $scope.userGroups.push(groups[i]);
        }
    };
    
    $scope.save = function() {
        Form.save($scope.form, function(form) {
            $location.path('#/listforms');        
        });
    };
 }