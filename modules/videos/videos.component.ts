import { Component } from '@angular/core';
import { Article } from 'shared/article/article.model';
import { ActivatedRoute } from '@angular/router';
import { NgIf } from '@angular/common';
import { SafeHtmlPipe } from '../non-core/pipes/safeHtml.pipe';

@Component({
    selector: 'cde-videos',
    templateUrl: 'videos.component.html',
    imports: [NgIf, SafeHtmlPipe],
    standalone: true,
})
export class VideosComponent {
    videos?: Article;

    constructor(private route: ActivatedRoute) {
        this.videos = this.route.snapshot.data.videos;
    }
}
