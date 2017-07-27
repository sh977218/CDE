import { Injectable } from "@angular/core";
import * as authorizationShared from "system/shared/authorizationShared";
import * as classificationShared from "system/shared/classificationShared";
import * as compareShared from "system/shared/compareShared";
import * as exportShared from "system/shared/exportShared";
import * as regStatusShared from "system/shared/regStatusShared";

import * as formShared from "form/shared/formShared.js";

@Injectable()
export class SharedService {
    static readonly auth = authorizationShared;
    static readonly classificationShared = classificationShared;
    static readonly compareShared = compareShared;
    static readonly exportShared = exportShared;
    static readonly regStatusShared = regStatusShared;

    static readonly formShared = formShared;
}
