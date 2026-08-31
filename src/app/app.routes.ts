import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'contacts',
        pathMatch: 'full'
    },
    {
        path: 'contacts',
        loadComponent: () =>
            import('./components/contacts-view/contacts-view').then(m => m.ContactsView)
    },
    {
        path: 'legal-notice',
        loadComponent: () =>
            import('./pages/legal-notice/legal-notice').then(m => m.LegalNotice)
    },
    {
        path: 'privacy-policy',
        loadComponent: () =>
            import('./pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy)
    },
    {
        path: 'help',
        loadComponent: () =>
            import('./pages/help/help').then(m => m.Help)
    },
    {
        path: 'add-task',
        loadComponent: () =>
            import('./pages/add-task/add-task').then(m => m.AddTask)
    }

];
