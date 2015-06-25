angular.module('systemModule').controller('OrgOverviewCtrl',
['$scope',
function($scope) {

$scope.orgs = [
    {name: "AHRQ", fullName: "Agency for Healthcare Research and Quality",  logo: "",
        source: "http://ushik.ahrq.gov/lists/DataElements?system=ps&enableAsynchronousLoading=true"}
    , {name: "NCI", fullName: "National Cancer Institute", logo: "", source: "https://cdebrowser.nci.nih.gov/CDEBrowser/"}
    , {name: "NINDS", fullName: "National Institute of Neurological Disorders and Stroke",
        logo: "", source: "http://www.commondataelements.ninds.nih.gov/cde.aspx"}
    , {name: "GRDR", fullName: "Global Rare Diseases Patient Registry and Data Repository", logo: "",
        source: "https://grdr.ncats.nih.gov/files/GRDR_CDEs_V2.1_May-2015.xls"}
    , {name: "NIDA", fullName: "National Institute on Drug Abuse", logo: "", source: "http://cde.drugabuse.gov/"}
    , {name: "PhenX", fullName: "Consensus measures for Phenotypes and exposures", logo: "", source: "https://www.phenxtoolkit.org"}
];


}]);