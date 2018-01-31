import * as authorizationShared from 'shared/system/authorizationShared';
import * as classificationShared from 'shared/system/classificationShared';
import * as deValidator from 'shared/de/deValidator.js';
import * as exportShared from 'shared/system/exportShared';
import * as regStatusShared from 'shared/system/regStatusShared';

export class SharedService {
    static readonly auth: any = authorizationShared;
    static readonly classificationShared: any = classificationShared;
    static readonly deValidator: any = deValidator;
    static readonly exportShared: any = exportShared;
    static readonly regStatusShared: any = regStatusShared;
}
