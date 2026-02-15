import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  template: `
    <!-- <app-header /> -->
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('QuizApp');
}
