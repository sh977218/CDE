exports.map = {
    'NCI': {
        'stewardOrgName': 'NCI',
        'orgName': 'NCI',
        'classificationOrgName': 'NCI',
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

