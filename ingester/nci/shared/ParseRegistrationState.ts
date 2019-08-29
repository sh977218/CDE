export function parseRegistrationState(nciXmlCde, orgInfo) {
    const registrationState = {
        registrationStatus: 'Qualified',
        administrativeStatus: nciXmlCde.WORKFLOWSTATUS[0]
    };
    if (!registrationState.registrationStatus) {
        registrationState.registrationStatus = orgInfo.statusMapping;
    }
    return registrationState;
}
