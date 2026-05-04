import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="app-shell">
      <router-outlet />
    </main>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      background: #0f0f1a;
      color: #e0e0e0;
      font-family: 'Inter', -apple-system, sans-serif;
    }
  `],
})
export class App {}