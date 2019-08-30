export const NCI_ORG_INFO_MAP = {
    'NCI Preferred Standards': {
        orgName: 'NCI Preferred Standards',
        stewardOrgName: 'NCI',
        classificationOrgName: 'NCI',
        mapAllClassification: 'NCI Preferred Standards',
        classificationMap: {NCI: 'NCI Preferred Standards'},
        filter() {
            return true;
        },
        statusMapping: {
            'Preferred Standard': 'Standard',
            Standard: 'Standard',
            Candidate: 'Recorded',
            Recorded: 'Recorded',
            Qualified: 'Qualified',
            Proposed: 'Incomplete',
            default: 'Incomplete'
        }
    },
    'NCI-BPV': {
        orgName: 'NCI-BPV',
        stewardOrgName: 'NCI',
        classificationOrgName: 'NCI-BPV',
        classificationMap: {'NCI-BPV': 'BBRB - BPV'},
        filter(contextName: string, b: string) {
            const allowBBRB = contextName === 'BBRB';
            const allowBPV = b === 'BPV - Tumor Biospecimen Acquisition';
            return !!(allowBBRB && allowBPV);
        },
        statusMapping: {
            'Preferred Standard': 'Standard',
            Standard: 'Standard',
            default: 'Qualified'
        }
    },
    'NCI-GTEx': {
        orgName: 'NCI-GTEx',
        stewardOrgName: 'NCI',
        classificationOrgName: 'NCI-GTEx',
        classificationMap: {'NCI-GTEx': 'BBRB - GTEx'},
        filter(contextName: string, b: string) {
            const allowBBRB = contextName === 'BBRB';
            const allowGTEx = b === 'GTEx - Postmortem Biospecimen Acquisition';
            return !!(allowBBRB && allowGTEx);
        },
        statusMapping: {
            'Preferred Standard': 'Standard',
            Standard: 'Standard',
            default: 'Qualified'
        }
    },
    'NCI-CDMH': {
        stewardOrgName: 'NCI',
        classificationOrgName: 'NCI',
        classificationMap: {'PCORTF CDMH': 'CDMH'},
        filter(contextName: string, b: string) {
            const allowBBRB = contextName === 'BBRB';
            const allowPCORI = contextName === 'PCORTF CDMH';
            const allowGTEx = b === 'GTEx - Postmortem Biospecimen Acquisition';
            const allowBPV = b === 'BPV - Tumor Biospecimen Acquisition';
            return (allowBBRB || allowPCORI) && (allowBPV || allowGTEx);
        },
        statusMapping: {
            'Preferred Standard': 'Standard',
            Standard: 'Standard',
            default: 'Qualified'
        }
    },
    'NCI-CDMH-PCORNet': {
        xml: 'S:/MLB/CDE/NCI/8-27-19/CDEBrowser_SearchResults_PCOR4.0_asOf-20190812.xml',
        stewardOrgName: 'NCI',
        classificationOrgName: 'NCI',
        classificationMap: {'PCORTF CDMH': 'PCORNet'},
        statusMapping: {
            'Preferred Standard': 'Standard',
            Standard: 'Standard',
            default: 'Qualified'
        }
    },
    'NCI-CDMH-OMOP': {
        xml: 'S:/MLB/CDE/NCI/8-27-19/CDEBrowser_SearchResults_OMOP5.2_asOf-20190812.xml',
        stewardOrgName: 'NCI',
        classificationOrgName: 'NCI',
        classificationMap: {'PCORTF CDMH': 'OMOP'},
        statusMapping: {
            'Preferred Standard': 'Standard',
            Standard: 'Standard',
            default: 'Qualified'
        }
    },
    'NCI-CDMH-ACT': {
        xml: 'S:/MLB/CDE/NCI/8-27-19/CDEBrowser_SearchResults_ACTI2b2-1.4_asOf-20190812.xml',
        stewardOrgName: 'NCI',
        classificationOrgName: 'NCI',
        classificationMap: {'PCORTF CDMH': 'ACT'},
        statusMapping: {
            'Preferred Standard': 'Standard',
            Standard: 'Standard',
            default: 'Qualified'
        }
    },
    'NCI-CDMH-Sentinel': {
        xml: 'S:/MLB/CDE/NCI/8-27-19/CDEBrowser_SearchResults_Sentinel6.02_asOf-20190812.xml',
        stewardOrgName: 'NCI',
        classificationOrgName: 'NCI',
        classificationMap: {'PCORTF CDMH': 'Sentinel'},
        statusMapping: {
            'Preferred Standard': 'Standard',
            Standard: 'Standard',
            default: 'Qualified'
        }
    },
    caDSR: {
        xml: 'S:/MLB/CDE/NCI/caDSR/CDEBrowser_SearchResults (46).xml',
        stewardOrgName: 'NCI',
        classificationOrgName: 'NCI',
        classificationMap: {'PCORTF CDMH': 'PCORNet'},
        statusMapping: {
            'Preferred Standard': 'Standard',
            Standard: 'Standard',
            default: 'Qualified'
        }
    }
};

