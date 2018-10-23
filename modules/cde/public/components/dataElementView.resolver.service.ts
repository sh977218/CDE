import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { DataElementViewService } from 'cde/public/components/dataElementView.service';
import { DataElement } from 'shared/de/dataElement.model';

@Injectable()
export class DataElementViewResolverService implements Resolve<DataElement> {
    constructor(private deViewService: DataElementViewService) {}

    resolve(route: ActivatedRouteSnapshot): Promise<DataElement> {
        return this.deViewService.fetchEltForEditing(route.queryParams);
    }
}
