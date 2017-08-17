import { Component, OnInit, ViewChild } from "@angular/core";
import { Http } from "@angular/http";
import { AlertService } from "../alert/alert.service";
import { SaveModalComponent } from "../../../../adminItem/public/components/saveModal/saveModal.component";

import * as ClassificationShared from "../../../system/shared/classificationShared.js";

@Component({
    selector: "cde-inbox",
    templateUrl: "inbox.component.html"
})
export class InboxComponent implements OnInit {

    @ViewChild("saveModal") public saveModal: SaveModalComponent;

    constructor(private http: Http,
                private alert: AlertService) {}

    mail: any = {received: [], sent: [], archived: []};
    currentMessage: any;

    ngOnInit () {
        this.getAllMail();
    }

    getMail (type) {
        // TODO make sure it's ordered by date
        this.http.post("/mail/messages/" + type, {}).map(r => r.json()).subscribe(mail => {
            this.mail[type] = mail;
            mail.forEach(msg => msg.humanType = this.decamelize(msg.type));
            this.fetchMRCdes(type);
        });
    };

    getAllMail () {
        this.getMail('received');
        this.getMail('sent');
        this.getMail('archived');
    };

    decamelize (str) {
        let result = str
            .replace(/([a-z\d])([A-Z])/g, '$1 $2')
            .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2')
            .toLowerCase();
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    fetchMRCdes (type) {
        let tinyIdList = this.mail[type].map(m => {
            if (m.typeRequest) return m.typeRequest.source.tinyId;
        });
        tinyIdList = tinyIdList.concat(this.mail[type].map(m => {
            if (m.typeRequest) return m.typeRequest.destination.tinyId;
        }));
        this.http.post("/cdesByTinyIdList", tinyIdList).map(r => r.json()).subscribe(result => {
            if (!result) return;
            let cdesKeyValuePair = {};
            result.forEach(cde => cdesKeyValuePair[cde.tinyId] = cde);
            this.mail[type].map(function (message) {
                if (message.type !== "MergeRequest") return;
                message.typeRequest.source.object = cdesKeyValuePair[message.typeRequest.source.tinyId];
                message.typeRequest.destination.object = cdesKeyValuePair[message.typeRequest.destination.tinyId];
            });
        }, () => {});
    }


    closeMessage (message) {
        message.states.unshift({
            "action" : "Approved",
            "date" : new Date(),
            "comment" : ""
        });
        this.http.post('/mail/messages/update', message).subscribe(() => {
            this.alert.addAlert("success", "Message moved to archived.");
            this.getAllMail();
        }, () => {
            this.alert.addAlert("danger", "Message couldn't be retired.");
        });
    }


    transferFields (source, destination, type) {
        if (!source[type]) return;

        let alreadyExists = function (obj) {
            delete obj.$$hashKey;
            return destination[type].map(function (obj) {
                return JSON.stringify(obj);
            }).indexOf(JSON.stringify(obj)) >= 0;
        };
        source[type].forEach(obj => {
            if (alreadyExists(obj)) return;
            destination[type].push(obj);
        });
    };

    approveMerge (source, destination, fields, callback) {
        this.http.get('/de/' + source.tinyId).map(r => r.json()).subscribe(result => {
            source = result;
            this.http.get('/de/' + destination.tinyId).map(r => r.json()).subscribe(result => {
                destination = result;
                Object.keys(fields).forEach(field => {
                    if (fields[field]) {
                        this.transferFields(source, destination, field);
                    }
                });

                if (fields.ids || fields.properties || fields.naming) {
                    ClassificationShared.transferClassifications(source, destination);
                    this.http.put("/de/" + result.tinyId, result).then(function () {
                        service.retireSource(service.source, service.destination, function (response) {
                            if (callback) callback(response);
                        });
                    });
                } else {
                    CdeClassificationTransfer.byTinyIds(service.source.tinyId, service.destination.tinyId, callback);
                }
            });

        })
    };

    approveMergeMessage (message) {
        this.approveMerge(
            this.currentMessage.typeRequest.source.object,
            this.currentMessage.typeRequest.destination.object,
            this.currentMessage.typeRequest.mergeFields,
            () => {
            this.closeMessage(this.currentMessage);
        });
    };


    showMergeApproveDialog (message) {
        this.currentMessage = message;


    }
    //     $modal.open({
    //         animation: false,
    //         templateUrl: '/system/public/html/saveModal.html',
    //         controller: 'MergeApproveModalCtrl',
    //         resolve: {
    //             elt: function () {
    //                 return message.typeRequest.destination.object;
    //             }, user: function () {
    //                 return userResource.user;
    //             }
    //         }
    //     }).result.then(function () {
    //         $scope.approveMergeMessage(message);
    //     }, function () {
    //     });
    // };


}