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
        'stewardOrgName': 'NCI',
        'classificationOrgName': 'NCI-BPV',
        'classificationMap': {'NCI-BPV': 'BBRB - BPV'},
        filter: function (contextName, b) {
            let allowBBRB = contextName === 'BBRB';
            let allowBPV = b === 'BPV - Tumor Biospecimen Acquisition';
            return !!(allowBBRB && allowBPV);
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
        'classificationOrgName': 'NCI-GTEx',
        'classificationMap': {'NCI-GTEx': 'BBRB - GTEx'},
        filter: function (contextName, b) {
            let allowBBRB = contextName === 'BBRB';
            let allowGTEx = b === 'GTEx - Postmortem Biospecimen Acquisition';
            return !!(allowBBRB && allowGTEx);
        },
        statusMapping: {
            "Preferred Standard": "Standard",
            "Standard": "Standard",
            "default": "Qualified"
        }
    },
    'NCI-CDMH': {
        'stewardOrgName': 'NCI',
        'classificationOrgName': 'NCI',
        'classificationMap': {'PCORTF CDMH': 'CDMH'},
        filter: function (contextName, b) {
            let allowBBRB = contextName === 'BBRB';
            let allowPCORI = contextName === 'PCORTF CDMH';
            let allowGTEx = b === 'GTEx - Postmortem Biospecimen Acquisition';
            let allowBPV = b === 'BPV - Tumor Biospecimen Acquisition';
            return (allowBBRB || allowPCORI) && (allowBPV || allowGTEx);
        },
        statusMapping: {
            "Preferred Standard": "Standard",
            "Standard": "Standard",
            "default": "Qualified"
        }
    },
    'NCI-CDMH-PCORNet': {
        'xml': 'S:/MLB/CDE/NCI/CdmhPcoriCdm/PCORNetFinalCDEBrowser_SearchResults.xml',
        'stewardOrgName': 'NCI',
        'classificationOrgName': 'NCI',
        'classificationMap': {'PCORTF CDMH': 'PCORNet'},
        statusMapping: {
            "Preferred Standard": "Standard",
            "Standard": "Standard",
            "default": "Qualified"
        }
    },
    'NCI-CDMH-OMOP': {
        'xml': 'S:/MLB/CDE/NCI/CdmhPcoriCdm/OMOPFINALCDEBrowser_SearchResults.xml',
        'stewardOrgName': 'NCI',
        'classificationOrgName': 'NCI',
        'classificationMap': {'PCORTF CDMH': 'OMOP'},
        statusMapping: {
            "Preferred Standard": "Standard",
            "Standard": "Standard",
            "default": "Qualified"
        }
    },
    'NCI-CDMH-ACT': {
        'xml': 'S:/MLB/CDE/NCI/CdmhPcoriCdm/ACTFINALCDEBrowser_SearchResults.xml',
        'stewardOrgName': 'NCI',
        'classificationOrgName': 'NCI',
        'classificationMap': {'PCORTF CDMH': 'ACT'},
        statusMapping: {
            "Preferred Standard": "Standard",
            "Standard": "Standard",
            "default": "Qualified"
        }
    },
    'NCI-CDMH-Sentinel': {
        'xml': 'S:/MLB/CDE/NCI/CdmhPcoriCdm/SentinelFinalCDEBrowser_SearchResults.xml',
        'stewardOrgName': 'NCI',
        'classificationOrgName': 'NCI',
        'classificationMap': {'PCORTF CDMH': 'Sentinel'},
        statusMapping: {
            "Preferred Standard": "Standard",
            "Standard": "Standard",
            "default": "Qualified"
        }
    }
};

