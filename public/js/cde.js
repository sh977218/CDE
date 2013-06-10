var cdeApp = angular.module('cde', ['resources', 'ui.bootstrap']).
    config(function($routeProvider) {
        $routeProvider.
        when('/edit/:cdeId', {controller:EditCtrl, templateUrl:'detail.html'}).
        when('/', {controller:ListCtrl, templateUrl:'/list'}).
        when('/login', {controller:AuthCtrl, templateUrl:'/login'}).
        when('/new', {controller:CreateCtrl, templateUrl:'detail.html'}).
        when('/listforms', {controller: ListFormsCtrl, templateUrl: '/listforms'}).
        when('/createform', {controller: CreateFormCtrl, templateUrl: '/createform'}).
        when('/formview', {controller: FormViewCtrl, templateUrl: '/formview'}).
        when('/cart', {controller: CartCtrl, templateUrl: '/cart'}).
        when('/nlmreleased', {controller: NlmReleaseCtrl, templateUrl: '/cdereview'}).
        when('/internalreview', {controller: InternalReviewCtrl, templateUrl: '/cdereview'}).
        otherwise({redirectTo:'/'});
    }).
    directive('inlineEdit', function() {
    return {
        template: '<div >' + 
                        '<div ng-hide="editMode">' + 
                            '<i ng-show="isAllowed()" class="icon-pencil" ng-click="value=model; editMode=true"></i> {{model}}' + 
                        '</div>' + 
                        '<div ng-show="editMode">' + 
                            '<input type="text" ng-model="value" />' + 
                            '<button class="icon-ok" ng-click="model = value; editMode = false; onOk()"/>' + 
                            '<button class="icon-remove" ng-click="editMode = false"/>' +
                        '</div>' +       
                    '</div>'
                ,
        restrict: 'E',
        scope: {
            model: '='
            , isAllowed: '&'
            , onOk: '&'
        }
    };
    }).
    directive('inlineAreaEdit', function() {
    return {
        template: '<div>' + 
                        '<div ng-hide="editMode">' + 
                         '   <i ng-show="isAllowed()" class="icon-pencil" ng-click="value=model; editMode=true"></i> {{model}}' +
                        '</div>' + 
                        '<div ng-show="editMode">' + 
                         '   <textarea ng-model="value" ></textarea>' + 
                          '  <button class="icon-ok" ng-click="model = value;editMode = false; onOk()"/>' + 
                           ' <button class="icon-remove" ng-click="editMode = false"/>' + 
                        '</div>       ' + 
                    '</div>',
        restrict: 'E',
        scope: {
            model: '='
            , isAllowed: '&'
            , onOk: '&'
        }
    };
    })
    .directive('draggable', function() {
        return {
            // A = attribute, E = Element, C = Class and M = HTML Comment
            restrict:'A',
            //The link function is responsible for registering DOM listeners as well as updating the DOM.
            link: function(scope, element, attrs) {
                element.draggable({
                    revert:true
                });
            }
        };
    });
    
    // This makes any element droppable
// Usage: <div droppable></div>
cdeApp.directive('droppable', function($compile) {
    return {
        restrict: 'A',
        link: function(scope,element,attrs){
            //This makes an element Droppable
            element.droppable({
            drop:function(event,ui) {
//                var dragIndex = angular.element(ui.draggable).data('index'),
//                reject = angular.element(ui.draggable).data('reject'),
//                dragEl = angular.element(ui.draggable).parent(),
//                dropEl = angular.element(this);
//                if (dragEl.hasClass('list1') && !dropEl.hasClass('list1') && reject !== true) {
//                    scope.list2.push(scope.list1[dragIndex]);
//                    scope.list1.splice(dragIndex, 1);
//                } else if (dragEl.hasClass('list2') && !dropEl.hasClass('list2') && reject !== true) {
//                    scope.list1.push(scope.list2[dragIndex]);
//                    scope.list2.splice(dragIndex, 1);
//                }
//                scope.$apply();
                }
            });
        }
    };
}); 
    
    