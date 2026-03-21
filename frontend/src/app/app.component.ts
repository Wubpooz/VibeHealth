import { Component, inject } from '@angular/core';
import { RouterOutlet, ChildrenOutletContexts } from '@angular/router';
import { GoeyToastComponent, ScrollTopProgressComponent } from './shared/components';
import { routeAnimations } from './shared/animations';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GoeyToastComponent, ScrollTopProgressComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [routeAnimations],
})
export class AppComponent {
  private readonly contexts = inject(ChildrenOutletContexts);

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
