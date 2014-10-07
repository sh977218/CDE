regStatusShared = {};
regStatusShared.statusList = [
    {
        name: 'Preferred Standard',
        help: "Preferred Standard elements are managed by the CDE Working Group and described by Meaninful Use terminology. <br/>\n\
             Preferred Standard elements can only be editied by the CDE Working Group"
        , curHelp: "Preferred Standard elements cannot be edited by their stewards"
    }
    , {
        name: 'Standard'
        ,help: "Standard elements are managed by the CDE Working Group. Standard elements can only be editied by the CDE Working Group." 
        , curHelp: "Standard elements cannot be edited by their stewards"
    }
    , {
        name: 'Qualified'
        , help: "Qualified elements are managed by their Stewards and may be eligible to become Standard."
        , curHelp: "Qualified elements should be well defined and will be visible to the public"
    }
    , {
        name: 'Recorded'
        , help: "Recorded elements are managed by their Stewards and indicate elements that have not yet been Qualified to become Standard."
        , curHelp: "Recorded elements are visible to the public"
    }
    , {
        name: 'Candidate'
        , help: "Candidate elements are only visible to their Stewards."
        , curHelp: "Candidate elements are not visible to the public"
    }
    , {
        name: 'Incomplete'
        , help: "Incomplete elements are only visible to their Stewards and indicate elements that are still in the process of being defined."
        , curHelp: "Incomplete indicates an element that is not fully defined. Incomplete elements are not visible to the public"
    }
    , {
        name: "Retired"
        , help: "Retired elements are not visible in searches. Indicates elements that are no longer used or superceded by another element."
        , curHelp: "Retired elements are not returned in searches"
    }
];