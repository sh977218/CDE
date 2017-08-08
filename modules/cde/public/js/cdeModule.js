angular.module('cdeModule', ['resourcesCde', 'CdeMerge', 'ngRoute', 'cdeTemplates', 'boardTemplates']).config(
    ["$routeProvider", function($routeProvider)
{
    $routeProvider.
        when('/cde/search', {
            template: '<cde-cde-search></cde-cde-search>',
            title: "Find Common Data Elements",
            keywords: 'cde, common data element, promis, neuro-qol, phenx, ahrq, ninds, repository',
            description: 'Repository of Common Data Elements (CDE). Search CDEs recommended by NIH. See their use in Protocol Forms.'
        }).
        when('/quickBoard', {template: '<div ng-include="\'/system/public/html/eltsCompareButton.html\'" ng-init="eltsToCompare=[{},{}]" style="display: none"></div></div><cde-quick-board></cde-quick-board>', title: "Quickboard"}).
        when('/sdcview', {controller: 'SDCViewCtrl', templateUrl: '/cde/public/html/sdcView.html'}).
        when('/cdeSearchExport', {templateUrl: '/cde/public/html/exportCdeSearch.html'}).
        when('/myboards', {controller: 'MyBoardsCtrl', templateUrl: '/cde/public/html/myBoards.html'}).
        when('/board/:boardId', {templateUrl: '/board/public/html/boardView.html'}).
        when('/boardList', {controller: 'BoardListCtrl', templateUrl: '/cde/public/html/boardList.html'}).
        when('/createCde', {controller: 'CreateCdeCtrl', templateUrl:'/cde/public/html/createCde.html'}).
        when('/deView', {controller: 'DEViewCtrl', templateUrl: '/cde/public/html/deView.html', title: "CDE Detail",
            keywords: 'cde, common data element, question, detail, value set, description',
            description: "Detailed view of selected Common Data Element (CDE)."}).
        when('/stats', {controller: 'MainCtrl', templateUrl: '/system/public/html/stats.html'}).
        when('/cdeStatusReport', {controller: 'ExportCtrl', templateUrl: '/system/public/html/cdeStatusReport.html'})
        ;
    }]);

import {downgradeComponent, downgradeInjectable} from "@angular/upgrade/static";

import {BoardCdeSummaryListComponent} from "../components/listView/boardCdeSummaryList.component";
angular.module('cdeModule').directive('cdeBoardCdeSummaryList',
    downgradeComponent({component: BoardCdeSummaryListComponent, inputs: ['board', 'cdes', 'module', 'currentPage', 'totalItems'], outputs: ['reload']}));

import {CreateBoardComponent} from "../../../board/public/components/createBoard/createBoard.component";
angular.module('systemModule').directive('cdeCreateBoard', downgradeComponent({component: CreateBoardComponent, inputs: [], outputs: []}));

import {QuickBoardComponent} from "../../../board/public/components/quickBoard/quickBoard.component";
angular.module('cdeModule').directive('cdeQuickBoard', downgradeComponent({component: QuickBoardComponent, inputs: [], outputs: []}));

import {CreateDataElementComponent} from "../components/createDataElement.component";
angular.module('cdeModule').directive('cdeCreateDataElement', downgradeComponent({component: CreateDataElementComponent, inputs: ['elt'], outputs: ['cancel','modelChange']}));

import {CdeSearchComponent} from "../components/search/cdeSearch.component";
angular.module('systemModule').directive('cdeCdeSearch', downgradeComponent({component: CdeSearchComponent,
    inputs: ['addMode'], outputs: []}));

import {DataElementViewComponent} from "../components/dataElementView.component";
angular.module('cdeModule').directive('cdeDataElementView', downgradeComponent({component: DataElementViewComponent, inputs: ['elt'], outputs: ['reload','stageElt']}));

import {CdeAccordionListNg2Component} from "../components/cdeAccordionListNg2.component";
angular.module('cdeModule').directive('cdeAccordionListNg2', downgradeComponent({component: CdeAccordionListNg2Component, inputs: ['cdes'], outputs: []}));

import {CreateFormFromBoardComponent} from "../../../board/public/components/createFormFromBoard.component";
angular.module('systemModule').directive('cdeCreateFormFromBoard', downgradeComponent({component: CreateFormFromBoardComponent, inputs: ['board'], outputs: []}));

import { ListViewComponent } from "../../../search/listView/listView.component";
angular.module('cdeModule').directive('cdeListView', downgradeComponent({component: ListViewComponent,
    inputs: ['board', 'currentPage', 'location', 'elts', 'listView', 'module', 'totalItems'], outputs: ['add', 'listViewChange']}));

import { ListViewControlsComponent } from "../../../search/listView/listViewControls.component";
angular.module('cdeModule').directive('cdeListViewControls', downgradeComponent({component: ListViewControlsComponent,
    inputs: ['listView'], outputs: ['listViewChange']}));
