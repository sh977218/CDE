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
 

function CreateFormCtrl($scope, $location, Form) {
    $scope.save = function() {
        Form.save($scope.form, function(form) {
            $location.path('#/listforms');        
        });
    };
 }

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
