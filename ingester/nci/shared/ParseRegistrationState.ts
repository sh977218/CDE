export function parseRegistrationState(nciXmlCde: any, orgInfo: any) {
    const registrationState = {
        registrationStatus: 'Qualified',
        administrativeStatus: nciXmlCde.WORKFLOWSTATUS[0]
    };
    if (!registrationState.registrationStatus) {
        registrationState.registrationStatus = orgInfo.statusMapping;
    }
    return registrationState;
}
