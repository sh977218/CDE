import { DEFAULT_RADX_UP_CONFIG } from 'ingester/phenx/Shared/utility';

export function parseRegistrationState(config = DEFAULT_RADX_UP_CONFIG) {
    return {
        registrationStatus: config.registrationStatus,
    };
}
