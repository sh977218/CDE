import { firstValueFrom, lastValueFrom, Observable, SubscriptionLike } from 'rxjs';

export function streamToPromise<T>(observable: Observable<T>) {
    return firstValueFrom(observable, {defaultValue: null});
}

export function toPromise<T>(observable: Observable<T>): Promise<T> { // use for Angular HttpClient streams that close immediately
    return lastValueFrom(observable); // use last to ensure the streams do close immediately
}
