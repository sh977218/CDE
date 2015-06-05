angular.module('cdeModule', ['resourcesCde', 'CdeMerge', 'ngRoute'])
.config(function($routeProvider) {
    $routeProvider.
        when('/cde/search', {controller: 'DEListCtrl', templateUrl: 'template/system/list'}).
        when('/quickBoard', {controller: 'QuickBoardCtrl', templateUrl: '/quickBoard'}).
        when('/sdcview', {controller: 'SDCViewCtrl', templateUrl: '/sdcView'}).
        when('/boardExport/:boardId', {controller: 'ExportCtrl', templateUrl: '/cde/public/html/boardExport.html'}).
        when('/cdeSearchExport', {controller: 'DEListCtrl', templateUrl: '/exportCdeSearch'}).
        when('/myboards', {controller: 'MyBoardsCtrl', templateUrl: '/myboards'}).
        when('/board/:boardId', {controller: 'BoardViewCtrl', templateUrl: '/board'}).
        when('/boardList', {controller: 'BoardListCtrl', templateUrl: '/boardList'}).
        when('/createCde', {controller: 'CreateCdeCtrl', templateUrl:'/createcde'}).
        when('/deview', {controller: 'DEViewCtrl', templateUrl: '/deview'}).
        when('/stats', {controller: 'MainCtrl', templateUrl: '/system/public/html/stats.html'});
    });