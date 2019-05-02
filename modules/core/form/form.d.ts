import { CdeForm, FormInForm } from 'shared/form/form.model';

declare function convertFormToSection(elt: CdeForm): FormInForm;
declare function getFormOdm(form: CdeForm, cb: (error: string, odm: any) => void): void;
