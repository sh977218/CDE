angular.module('cdeModule', ['resourcesCde', 'CdeMerge', 'ngRoute', 'cdeTemplates', 'boardTemplates']).config(
    ["$routeProvider", function($routeProvider)
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
        when('/board/:boardId', {controller: 'SwitchListViewCtrl', templateUrl: '/board/public/html/boardView.html'}).
        when('/boardList', {controller: 'BoardListCtrl', templateUrl: '/cde/public/html/boardList.html'}).
        when('/createCde', {controller: 'CreateCdeCtrl', templateUrl:'/cde/public/html/createCde.html'}).
        when('/deview', {controller: 'DEViewCtrl', templateUrl: '/cde/public/html/deView.html', title: "CDE Detail",
            keywords: 'cde, common data element, question, detail, value set, description',
            description: "Detailed view of selected Common Data Element (CDE)."}).
        when('/stats', {controller: 'MainCtrl', templateUrl: '/system/public/html/stats.html'}).
        when('/cdeStatusReport', {controller: 'ExportCtrl', templateUrl: '/system/public/html/cdeStatusReport.html'})
        ;
    }]);

// Angular 2 upgraded
angular.module('cdeModule').directive('cdeAccordionList', function () {
    return {
        scope: {cdes: '=', ejsPage: '=', module: '='},
        template: require('../html/cdeAccordionList.html')};
});

import {downgradeComponent, downgradeInjectable} from "@angular/upgrade/static";

import {LinkedFormsComponent} from "../../../system/public/components/linkedForms.component";
angular.module('cdeModule').directive('cdeLinkedForms', downgradeComponent({component: LinkedFormsComponent, inputs: ['elt', 'eltType'], outputs: []}));

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

import {DeGeneralDetailsComponent} from "../components/deGeneralDetails/deGeneralDetails.component";
angular.module('systemModule').directive('cdeDeGeneralDetails', downgradeComponent({component: DeGeneralDetailsComponent, inputs: ['elt'], outputs: []}));

import {ValueDomainSummaryComponent} from "../components/summary/valueDomainSummary.component";
angular.module('systemModule').directive('cdeValueDomainSummary', downgradeComponent({component: ValueDomainSummaryComponent, inputs: ['elt'], outputs: []}));

import {CdeSummaryListComponent} from "../components/summary/cdeSummaryList.component";
angular.module('systemModule').directive('cdeCdeSummaryList', downgradeComponent({component: CdeSummaryListComponent, inputs: ['cdes'], outputs: []}));

import {CreateBoardComponent} from "../../../board/public/components/createBoard/createBoard.component";
angular.module('systemModule').directive('cdeCreateBoard', downgradeComponent({component: CreateBoardComponent, inputs: [], outputs: []}));

import {PermissibleValueComponent} from "../components/permissibleValue.component";
angular.module('cdeModule').directive('cdePermissibleValue', downgradeComponent({component: PermissibleValueComponent, inputs: ['elt'], outputs: []
}));
