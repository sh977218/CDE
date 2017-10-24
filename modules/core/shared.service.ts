import * as authorizationShared from "system/shared/authorizationShared";
import * as classificationShared from "system/shared/classificationShared";
import * as formShared from "form/shared/formShared";
import * as exportShared from "system/shared/exportShared";
import * as regStatusShared from "system/shared/regStatusShared";

export class SharedService {
    static readonly auth: any = authorizationShared;
    static readonly classificationShared: any = classificationShared;
    static readonly exportShared: any = exportShared;
    static readonly formShared: any = formShared;
    static readonly regStatusShared: any = regStatusShared;
}
