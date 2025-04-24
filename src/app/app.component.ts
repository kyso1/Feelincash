import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  public appPages = [
    { title: 'Home', url: '/inserir', icon: 'home' },
    { title: 'Transações', url: '/transactions', icon: 'wallet' },
    { title: 'Gráficos', url: '/graphic', icon: 'bar-chart' }
  ];
  constructor() {}
}
