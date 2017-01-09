exports.map = {
    'NCI': {
        'stewardOrgName': 'NCI',
        'orgName': 'NCI',
        'classificationOrgName': 'NCI',
        'extraClassifications': [],
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
        'stewardOrgName': 'NCI',
        'classificationOrgName': 'NCI',
        'extraClassifications': [],
        'classificationMap': {
            'BBRB': 'BBRB - BPV'
        },
        filter: function (ctxName, classificationAllowed) {
            return !!(ctxName === 'BBRB' && classificationAllowed === 'BPV - Tumor Biospecimen Acquisition');
        },
        statusMapping: {
            "Preferred Standard": "Standard",
            "Standard": "Standard",
            "default": "Qualified"
        }
    },
    'NCI-GTEx': {
        'orgName': 'NCI-GTEx',
        'stewardOrgName': 'NCI',
        'classificationOrgName': 'NCI',
        'extraClassifications': [],
        'classificationMap': {
            'BBRB': 'BBRB - GTEx'
        },
        filter: function (ctxName, classificationAllowed) {
            return !!(ctxName === 'BBRB' && classificationAllowed === 'GTEx - Postmortem Biospecimen Acquisition');
        },
        statusMapping: {
            "Preferred Standard": "Standard",
            "Standard": "Standard",
            "default": "Qualified"
        }
    }
};

