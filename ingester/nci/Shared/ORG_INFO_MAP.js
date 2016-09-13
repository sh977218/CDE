exports.map = {
    'NCI': {
        'stewardOrgName':'NCI',
        'orgName': 'NCI',
        'classificationOrgName': 'NCI',
        filter: function (a, b) {
            return true;
        }
    },
    'NCI-BPV': {
        'orgName': 'NCI-BPV',
        'stewardOrgName':'NCI',
        'classificationOrgName': 'NCI-BPV',
        filter: function (a, b) {
            if (a === 'BBRB' && b === 'BPV - Tumor Biospecimen Acquisition') {
                return true;
            } else return false;
        }
    },
    'NCI-GTEx': {
        'orgName': 'NCI-GTEx',
        'stewardOrgName':'NCI',
        'classificationOrgName': 'NCI-GTEx',
        filter: function (a, b) {
            if (a === 'BBRB' && b === 'GTEx - Postmortem Biospecimen Acquisition') {
                return true;
            } else return false;
        }
    }
};