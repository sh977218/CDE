import { CdeForm, FormElement } from 'shared/form/form.model';
import { FhirQuestionnaire, FhirQuestionnaireItem } from 'shared/mapping/fhir/fhirResource.model';

declare function formToQuestionnaire(form: CdeForm, options: any, config: any): FhirQuestionnaire;
declare function feToQuestionnaireItem(form: CdeForm, fe: FormElement, options: any, config: any): FhirQuestionnaireItem[];
