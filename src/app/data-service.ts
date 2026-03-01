import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  readonly httpClient = inject(HttpClient);


  getData(): Observable<any> {
    return this.httpClient.get('api/hello')
  }
}
