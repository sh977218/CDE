import { POST } from 'common/fetch';
import { CdeForm } from 'shared/form/form.model';
import {
    FormBundleRequest,
    FormBundleResponse,
} from 'shared/boundaryInterfaces/API/form';

export function bundleCreate(tinyId: string): Promise<CdeForm> {
    return POST<FormBundleRequest, FormBundleResponse>(
        '/server/form/bundle/' + tinyId,
        undefined
    );
}
export function bundleDestroy(tinyId: string): Promise<CdeForm> {
    return POST<FormBundleRequest, FormBundleResponse>(
        '/server/form/unbundle/' + tinyId,
        undefined
    );
}
