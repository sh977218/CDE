import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from 'alert/alert.service';

@Injectable()
export class MeshSyncService {
    meshSyncs: any;

    constructor(private http: HttpClient, private alert: AlertService) {}

    syncMesh() {
        this.http.post('/server/mesh/syncWithMesh', {}).subscribe();
        const indexFn = setInterval(() => {
            this.http.get<any>('/server/mesh/syncWithMesh').subscribe(
                res => {
                    this.meshSyncs = [];
                    for (const p in res) {
                        if (res.hasOwnProperty(p)) {
                            this.meshSyncs.push(res[p]);
                        }
                    }
                    if (res.dataelement.done === res.dataelement.total && res.form.done === res.form.total) {
                        clearInterval(indexFn);
                        this.alert.addAlert('success', 'Done syncing');
                        this.meshSyncs = null;
                    }
                },
                () => {
                    clearInterval(indexFn);
                    this.alert.addAlert('danger', 'Unexpected error syncing');
                }
            );
        }, 1000);
    }
}
