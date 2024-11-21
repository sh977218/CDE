const administrativeStatusMap: Record<string, string> = {
    'nlm review:': 'NLM Review',
    'org revise': 'Org Revise',
    'org approve': 'Org Approve',
    'gov review': 'Gov Review',
    'published': 'Published',
    'not endorsed': 'Not Endorsed',
    'retired': 'Retired',
    'released': 'Released',
}

export function parseRegistrationState(nciXmlCde: any, orgInfo: any) {
    const registrationState = {
        registrationStatus: 'Qualified',
        administrativeStatus: nciXmlCde.workflowStatusName[0]
    };
    if (!registrationState.registrationStatus) {
        registrationState.registrationStatus = orgInfo.statusMapping;
    }
    return registrationState;
}

export function parseRegistrationState2(nciXmlCde: any, orgInfo: any) {
    const registrationState = {
        registrationStatus: 'Qualified',
        administrativeStatus: administrativeStatusMap[nciXmlCde.workflowStatusName[0].toLowerCase()]
    };
    if (!registrationState.registrationStatus) {
        registrationState.registrationStatus = orgInfo.statusMapping;
    }
    return registrationState;
}
