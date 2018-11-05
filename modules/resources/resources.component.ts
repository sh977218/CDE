import { Component } from '@angular/core';

@Component({
    selector: 'cde-resources',
    templateUrl: './resources.component.html'
})
export class ResourcesComponent {
    pictures = [{src: '/system/public/img/1.png'}, {src: '/system/public/img/2.png'}, {src: '/system/public/img/3.png'}];
}
