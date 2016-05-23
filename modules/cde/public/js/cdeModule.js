angular.module('cdeModule', ['resourcesCde', 'CdeMerge', 'ngRoute']).config(function($routeProvider)
{
    $routeProvider.
        when('/cde/search', {
            controller: 'ListCtrl',
            subCtrl: 'DEListCtrl',
            templateUrl: '/system/public/html/list.html',
            reloadOnSearch: false,
            title: "Find Common Data Elements",
            keywords: 'cde, common data element, promis, neuro-qol, phenx, ahrq, ninds, repository',
            description: 'Repository of Common Data Elements (CDE). Search CDEs recommended by NIH. See their use in Protocol Forms.'
        }).
        when('/quickBoard', {controller: 'QuickBoardCtrl', templateUrl: '/cde/public/html/quickBoard.html', title: "Quickboard"}).
        when('/sdcview', {controller: 'SDCViewCtrl', templateUrl: '/cde/public/html/sdcView.html'}).
        when('/boardExport/:boardId', {controller: 'ExportCtrl', templateUrl: '/cde/public/html/boardExport.html'}).
        when('/cdeSearchExport', {controller: 'DEListCtrl', templateUrl: '/cde/public/html/exportCdeSearch.html'}).
        when('/myboards', {controller: 'MyBoardsCtrl', templateUrl: '/cde/public/html/myBoards.html'}).
        when('/board/:boardId', {controller: 'BoardViewCtrl', templateUrl: '/cde/public/html/boardView.html'}).
        when('/boardList', {controller: 'BoardListCtrl', templateUrl: '/cde/public/html/boardList.html'}).
        when('/createCde', {controller: 'CreateCdeCtrl', templateUrl:'/cde/public/html/createCde.html'}).
        when('/deview', {controller: 'DEViewCtrl', templateUrl: '/cde/public/html/deView.html', title: "CDE Detail",
            keywords: 'cde, common data element, question, detail, value set, description',
            description: "Detailed view of selected Common Data Element (CDE)."}).
        when('/stats', {controller: 'MainCtrl', templateUrl: '/system/public/html/stats.html'});
    });