import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'candidates',
    loadComponent: () =>
      import('./candidate/pages/candidate-list/candidate-list.component').then(
        (m) => m.CandidateListComponent
      ),
    title: 'Lista de Candidatos',
  },
  {
    path: 'candidates/:id',
    loadComponent: () =>
      import(
        './candidate/pages/candidate-detail/candidate-detail.component'
      ).then((m) => m.CandidateDetailComponent),
    title: 'Detalle del Candidato',
  },
  {
    path: '',
    redirectTo: 'candidates',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'candidates',
  },
];
