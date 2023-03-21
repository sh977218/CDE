import { Component } from '@angular/core';
import { Article } from 'shared/article/article.model';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'cde-videos',
    templateUrl: 'videos.component.html',
})
export class VideosComponent {
    videos?: Article;

    constructor(private route: ActivatedRoute) {
        this.videos = this.route.snapshot.data.videos;
    }
}
