import { CdeForm } from 'shared/form/form.model';

export function isMappedTo(f, systemOrProtocol) {
    return !!f.mapTo && !!f.mapTo[systemOrProtocol];
}
