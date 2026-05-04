import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'upload',
    pathMatch: 'full',
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./features/upload/upload.component').then(
        (m) => m.UploadComponent
      ),
  },
  {
    path: 'datasets/:id',
    loadComponent: () =>
      import('./features/dataset-detail/dataset-detail.component').then(
        (m) => m.DatasetDetailComponent
      ),
  },
  {
    path: 'dashboard/:id',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },{
  path: 'live',
  loadComponent: () =>
    import('./features/live-feed/live-feed.component').then(
      (m) => m.LiveFeedComponent
    ),
},
];