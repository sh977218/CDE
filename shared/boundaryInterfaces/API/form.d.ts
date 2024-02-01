import { RequestHandler } from 'express';
import { CdeForm } from 'shared/form/form.model';

type FormBundleRequest = void;
type FormBundleRequestHandler = RequestHandler<
    {
        tinyId: string;
    },
    FormBundleResponse,
    FormBundleRequest,
    never,
    CdeForm
>;
type FormBundleResponse = CdeForm;
