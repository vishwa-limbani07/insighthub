import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <!-- Top Navbar -->
    <nav class="navbar">
      <div class="navbar-inner">
        <a routerLink="/" class="nav-brand">
          <span class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="12" width="4" height="9" rx="1"/>
              <rect x="10" y="7" width="4" height="14" rx="1"/>
              <rect x="17" y="3" width="4" height="18" rx="1"/>
            </svg>
          </span>
          <span class="brand-text">InsightHub</span>
        </a>

        <div class="nav-links" [class.open]="mobileMenuOpen">
          <a routerLink="/upload" routerLinkActive="active" class="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload
          </a>
          <a routerLink="/live" routerLinkActive="active" class="nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            Live Feed
          </a>
        </div>

        <button class="mobile-toggle" (click)="mobileMenuOpen = !mobileMenuOpen">
          @if (mobileMenuOpen) {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          } @else {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          }
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .navbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: var(--color-bg);
      border-bottom: 1px solid var(--color-border-light);
      backdrop-filter: blur(12px);
      background: rgba(255, 255, 255, 0.85);
    }

    .navbar-inner {
      max-width: var(--container-max);
      margin: 0 auto;
      padding: 0 var(--space-6);
      height: var(--navbar-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 700;
      font-size: var(--text-lg);
      color: var(--color-text-primary);
      letter-spacing: var(--tracking-tight);
      transition: opacity var(--transition-fast);

      &:hover { opacity: 0.8; }

      .brand-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: var(--color-accent);
        color: white;
        border-radius: var(--radius-md);
      }
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-sm);
      font-weight: 500;
      color: var(--color-text-secondary);
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);

      &:hover {
        color: var(--color-text-primary);
        background: var(--color-bg-hover);
      }

      &.active {
        color: var(--color-accent);
        background: var(--color-accent-muted);
      }
    }

    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      padding: var(--space-2);
      color: var(--color-text-secondary);
      border-radius: var(--radius-md);

      &:hover { background: var(--color-bg-hover); }
    }

    .main-content {
      min-height: calc(100vh - var(--navbar-height));
    }

    @media (max-width: 640px) {
      .navbar-inner {
        padding: 0 var(--space-4);
      }

      .mobile-toggle { display: flex; }

      .nav-links {
        display: none;
        position: absolute;
        top: var(--navbar-height);
        left: 0;
        right: 0;
        background: var(--color-bg);
        border-bottom: 1px solid var(--color-border-light);
        padding: var(--space-2) var(--space-4);
        flex-direction: column;
        align-items: stretch;
        box-shadow: var(--shadow-lg);

        &.open { display: flex; }

        .nav-link {
          padding: var(--space-3) var(--space-4);
        }
      }
    }
  `],
})
export class App {
  mobileMenuOpen = false;
}