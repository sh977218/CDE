exports.parseRegistrationState = (nciCde, orgInfo) => {
    let registrationState = {
        registrationStatus: 'Qualified',
        administrativeStatus: nciCde.WORKFLOWSTATUS[0]
    };
    if (!registrationState.registrationStatus) {
        registrationState.registrationStatus = orgInfo.statusMapping;
    }
    return registrationState;
};
