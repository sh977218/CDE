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
        when('/deview', {controller: 'DEViewCtrl', templateUrl: '/cde/public/html/deView.html', title: "CDE Detail",
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

import {DatasetsComponent} from "../components/datasets/datasets.component";
angular.module('cdeModule').directive('cdeDatasets', downgradeComponent({component: DatasetsComponent, inputs: ['elt'], outputs: []}));

import {MoreLikeThisComponent} from "../components/mlt/moreLikeThis.component";
angular.module('cdeModule').directive('cdeMlt', downgradeComponent({component: MoreLikeThisComponent, inputs: ['elt'], outputs: []}));

import {ConceptsComponent} from "../components/concepts.component";
angular.module('cdeModule').directive('cdeConcepts', downgradeComponent({component: ConceptsComponent, inputs: ['elt'], outputs: []}));

import {DerivationRulesComponent} from "../components/derivationRules.component";
angular.module('cdeModule').directive('cdeDerivationRules', downgradeComponent({component: DerivationRulesComponent, inputs: ['elt'], outputs: []}));

import {CdeGeneralDetailsComponent} from "../components/summary/cdeGeneralDetails.component";
angular.module('systemModule').directive('cdeCdeGeneralDetails', downgradeComponent({component: CdeGeneralDetailsComponent, inputs: ['elt'], outputs: []}));

import {CdeSearchComponent} from "../components/search/cdeSearch.component";
angular.module('systemModule').directive('cdeCdeSearch', downgradeComponent({component: CdeSearchComponent, inputs: ['addMode'], outputs: []}));

import {DeGeneralDetailsComponent} from "../components/deGeneralDetails/deGeneralDetails.component";
angular.module('systemModule').directive('cdeDeGeneralDetails', downgradeComponent({component: DeGeneralDetailsComponent, inputs: ['elt'], outputs: []}));

import {LinkedFormsComponent} from "../../../adminItem/public/components/linkedForms.component";
angular.module('cdeModule').directive('cdeLinkedForms', downgradeComponent({component: LinkedFormsComponent, inputs: ['elt', 'eltType'], outputs: []}));

import { ListViewComponent } from "../../../search/listView/listView.component";
angular.module('cdeModule').directive('cdeListView', downgradeComponent({component: ListViewComponent,
    inputs: ['board', 'currentPage', 'ejsPage', 'elts', 'listView', 'module', 'totalItems'], outputs: ['add', 'listViewChange']}));

import { ListViewControlsComponent } from "../../../search/listView/listViewControls.component";
angular.module('cdeModule').directive('cdeListViewControls', downgradeComponent({component: ListViewControlsComponent, inputs: ['listView'], outputs: ['listViewChange']}));

import {ValueDomainSummaryComponent} from "../components/summary/valueDomainSummary.component";
angular.module('systemModule').directive('cdeValueDomainSummary', downgradeComponent({component: ValueDomainSummaryComponent, inputs: ['elt'], outputs: []}));

import {CreateBoardComponent} from "../../../board/public/components/createBoard/createBoard.component";
angular.module('systemModule').directive('cdeCreateBoard', downgradeComponent({component: CreateBoardComponent, inputs: [], outputs: []}));

import {PermissibleValueComponent} from "../components/permissibleValue.component";
angular.module('cdeModule').directive('cdePermissibleValue', downgradeComponent({component: PermissibleValueComponent, inputs: ['elt'], outputs: []}));

import {QuickBoardComponent} from "../../../board/public/components/quickBoard/quickBoard.component";
angular.module('cdeModule').directive('cdeQuickBoard', downgradeComponent({component: QuickBoardComponent, inputs: [], outputs: []}));

import {ValidRulesComponent} from "../components/validationRules/validRules.component";
angular.module('cdeModule').directive('cdeValidRules', downgradeComponent({component: ValidRulesComponent, inputs: ['elt'], ouputs: []}));
