exports.map = {
    'NCI Preferred Standards': {
        'orgName': 'NCI Preferred Standards',
        'stewardOrgName': 'NCI',
        'classificationOrgName': 'NCI',
        'mapAllClassification': 'NCI Preferred Standards',
        'classificationMap': {'NCI': 'NCI Preferred Standards'},
        filter: function () {
            return true;
        },
        statusMapping: {
            "Preferred Standard": "Standard",
            "Standard": "Standard",
            "Candidate": "Recorded",
            "Recorded": "Recorded",
            "Qualified": "Qualified",
            "Proposed": "Incomplete",
            "default": "Incomplete"
        }
    },
    'NCI-BPV': {
        'orgName': 'NCI-BPV',
        'stewardOrgName':'NCI',
        'classificationOrgName': 'NCI-BPV',
        'classificationMap': {'NCI-BPV': 'BBRB - BPV'},
        filter: function (a, b) {
            return !!(a === 'BBRB' && b === 'BPV - Tumor Biospecimen Acquisition');
        },
        statusMapping: {
            "Preferred Standard": "Standard",
            "Standard": "Standard",
            "default": "Qualified"
        }
    },
    'NCI-GTEx': {
        'orgName': 'NCI-GTEx',
        'stewardOrgName':'NCI',
        'classificationOrgName': 'NCI-GTEx',
        'classificationMap': {'NCI-GTEx': 'BBRB - GTEx'},
        filter: function (a, b) {
            return !!(a === 'BBRB' && b === 'GTEx - Postmortem Biospecimen Acquisition');
        },
        statusMapping: {
            "Preferred Standard": "Standard",
            "Standard": "Standard",
            "default": "Qualified"
        }
    }
};

