import {Component, inject, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {DataService} from './data-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('bachelor-work-app');
  private readonly httpService = inject(DataService);
  constructor() {

    this.httpService.getData().subscribe(data => {
      console.log(data);
    })
  }
}
