import * as classificationShared from 'shared/system/classificationShared';
import * as exportShared from 'shared/system/exportShared';
import * as regStatusShared from 'shared/system/regStatusShared';

export class SharedService {
    static readonly classificationShared: any = classificationShared;
    static readonly exportShared: any = exportShared;
    static readonly regStatusShared: any = regStatusShared;
}
