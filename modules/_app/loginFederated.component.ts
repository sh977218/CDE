import { Component } from '@angular/core';

@Component({
    selector: 'nih-cde',
    template: ``,
})
export class LoginFederatedComponent {
    constructor() {
        setTimeout(() => {
            const startChild = document.createElement('p');
            startChild.textContent = 'Loading...';
            document.querySelector('body').appendChild(startChild);
            if (window.location.search.startsWith('?')) {
                const query = window.location.search
                    .substr(1)
                    .split('&')
                    .map(x => x.split('='));
                function getQuery(p) {
                    const r = query.filter(x => x[0] === p)[0];
                    return r && (r.length === 2 ? r[1] : true);
                }
                const ticket = getQuery('ticket');
                if (ticket) {
                    const loginChild = document.createElement('p');
                    loginChild.textContent = 'Logging in...';
                    document.querySelector('body').appendChild(loginChild);
                    const body: any = {
                        ticket,
                        username: 'x',
                        password: 'x',
                        federated: true,
                    };
                    if (window.location.href.indexOf('-green.') !== -1) {
                        body.green = true;
                    }
                    fetch('/server/system/login', {
                        method: 'post',
                        headers: {
                            'Content-type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify(body),
                    })
                        .then(res => res.text())
                        .then(
                            text => {
                                const authChild = document.createElement('p');
                                authChild.textContent = 'done';
                                document.querySelector('body').appendChild(authChild);
                                const thisRoute = '/loginFederated';
                                const service = window.location.href.substr(0, window.location.href.indexOf(thisRoute));
                                if (text === 'OK' && service) {
                                    if (window.opener && window.opener.loggedIn) {
                                        try {
                                            window.opener.loggedIn();
                                            window.close();
                                        } catch (err) {
                                            const errorChild = document.createElement('p');
                                            errorChild.textContent = err;
                                            document.querySelector('body').appendChild(errorChild);

                                            const errorChild1 = document.createElement('p');
                                            errorChild1.textContent = 'Flat Catch: ' + JSON.stringify(err);
                                            document.querySelector('body').appendChild(errorChild1);
                                        }
                                    } else {
                                        const url = window.sessionStorage.getItem('nlmcde.lastRoute');
                                        if (url) {
                                            const savedQuery = window.sessionStorage.getItem('nlmcde.lastRouteQuery');
                                            window.sessionStorage.removeItem('nlmcde.lastRoute');
                                            window.sessionStorage.removeItem('nlmcde.lastRouteQuery');
                                            window.location.href = service + url + (savedQuery || '');
                                        } else {
                                            window.location.href = service + '/home';
                                        }
                                    }
                                } else {
                                    const child = document.createElement('h1');
                                    child.textContent = 'Login Failed ' + ' text: ' + text + ' service: ' + service;
                                    document.querySelector('body').appendChild(child);
                                }
                            },
                            err => {
                                const child = document.createElement('h1');
                                child.textContent = 'Login Error';
                                document.querySelector('body').appendChild(child);

                                const errorChild = document.createElement('p');
                                errorChild.textContent = err;
                                document.querySelector('body').appendChild(errorChild);

                                const errorChild1 = document.createElement('p');
                                errorChild1.textContent = 'Flat: ' + JSON.stringify(err);
                                document.querySelector('body').appendChild(errorChild1);
                            }
                        );
                } else {
                    const child = document.createElement('h1');
                    child.textContent = 'Ticket Missing';
                    document.querySelector('body').appendChild(child);
                }
            } else {
                const child = document.createElement('h1');
                child.textContent = 'Ticket Param Missing';
                document.querySelector('body').appendChild(child);
            }
        }, 0);
    }
}
