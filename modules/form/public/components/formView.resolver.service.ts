import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { FormViewService } from 'form/public/components/formView.service';
import { CdeForm } from 'shared/form/form.model';

@Injectable()
export class FormViewResolverService implements Resolve<CdeForm> {
    constructor(private formViewService: FormViewService) {}

    resolve(route: ActivatedRouteSnapshot): Promise<CdeForm> {
        return this.formViewService.fetchEltForEditing(route.queryParams);
    }
}
