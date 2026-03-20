import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoeyToastComponent, ScrollTopProgressComponent } from './shared/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GoeyToastComponent, ScrollTopProgressComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}
