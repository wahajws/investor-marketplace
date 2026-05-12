import { createBrowserRouter } from 'react-router-dom';
import { RequireAuth } from '../features/auth/RequireAuth';
import { AccountPage } from '../pages/account/AccountPage';
import { SecurityPage } from '../pages/account/SecurityPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '../pages/auth/VerifyEmailPage';
import { AdminDashboardPage } from '../pages/dashboard/AdminDashboardPage';
import { FounderDashboardPage } from '../pages/dashboard/FounderDashboardPage';
import { InvestorDashboardPage } from '../pages/dashboard/InvestorDashboardPage';
import {
  AdminAiRunsPage,
  AdminAuditPage,
  AdminCompaniesPage,
  AdminHomePage,
  AdminOrganizationsPage,
  AdminSettingsPage,
  AdminUsersPage,
  FounderAiPage,
  FounderCompanyPage,
  FounderDocumentsPage,
  FounderFundraisingPage,
  FounderHomePage,
  FounderMatchesPage,
  FounderMetricsPage,
  FounderProfilePage,
  FounderTeamPage,
  FounderValuationReadinessPage,
  InvestmentMemosPage,
  InvestorDiscoverPage,
  InvestorHomePage,
  InvestorMatchesPage,
  InvestorOrganizationPage,
  InvestorPipelinePage,
  InvestorPreferencesPage,
  InvestorProfilePage,
  NotificationsPage,
  RequestsPage
} from '../pages/mvp/MvpPages';
import { PublicHomePage } from '../pages/public/PublicHomePage';
import { AdminResourcePage, FounderResourcePage, InvestorResourcePage } from '../pages/shared/RouteFactory';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicHomePage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />
  },
  {
    element: <RequireAuth roles={['ADMIN']} />,
    children: [
      {
        path: '/admin',
        element: <AdminHomePage />
      },
      {
        path: '/admin/users',
        element: <AdminUsersPage />
      },
      {
        path: '/admin/organizations',
        element: <AdminOrganizationsPage />
      },
      {
        path: '/admin/companies',
        element: <AdminCompaniesPage />
      },
      {
        path: '/admin/ai-runs',
        element: <AdminAiRunsPage />
      },
      {
        path: '/admin/matches',
        element: <AdminResourcePage title="Matches" endpoint="/admin/matches" />
      },
      {
        path: '/admin/settings',
        element: <AdminSettingsPage />
      },
      {
        path: '/admin/audit-logs',
        element: <AdminAuditPage />
      }
    ]
  },
  {
    element: <RequireAuth roles={['FOUNDER']} />,
    children: [
      {
        path: '/founder',
        element: <FounderHomePage />
      },
      {
        path: '/founder/onboarding',
        element: <FounderResourcePage title="Founder Onboarding" endpoint="/founder/dashboard/summary" />
      },
      {
        path: '/founder/profile',
        element: <FounderProfilePage />
      },
      {
        path: '/founder/company',
        element: <FounderCompanyPage />
      },
      {
        path: '/founder/company/team',
        element: <FounderTeamPage />
      },
      {
        path: '/founder/company/metrics',
        element: <FounderMetricsPage />
      },
      {
        path: '/founder/company/fundraising',
        element: <FounderFundraisingPage />
      },
      {
        path: '/founder/company/documents',
        element: <FounderDocumentsPage />
      },
      {
        path: '/founder/company/ai-feedback',
        element: <FounderAiPage />
      },
      {
        path: '/founder/company/valuation',
        element: <FounderValuationReadinessPage mode="valuation" />
      },
      {
        path: '/founder/company/readiness',
        element: <FounderValuationReadinessPage mode="readiness" />
      },
      {
        path: '/founder/matched-investors',
        element: <FounderMatchesPage />
      },
      {
        path: '/founder/requests',
        element: <RequestsPage role="Founder" />
      }
    ]
  },
  {
    element: <RequireAuth roles={['INVESTOR']} />,
    children: [
      {
        path: '/investor',
        element: <InvestorHomePage />
      },
      {
        path: '/investor/onboarding',
        element: <InvestorResourcePage title="Investor Onboarding" endpoint="/investor/dashboard/summary" />
      },
      {
        path: '/investor/profile',
        element: <InvestorProfilePage />
      },
      {
        path: '/investor/preferences',
        element: <InvestorPreferencesPage />
      },
      {
        path: '/investor/organization',
        element: <InvestorOrganizationPage />
      },
      {
        path: '/investor/discover',
        element: <InvestorDiscoverPage />
      },
      {
        path: '/investor/matched-startups',
        element: <InvestorMatchesPage />
      },
      {
        path: '/investor/pipeline',
        element: <InvestorPipelinePage />
      },
      {
        path: '/investor/memos',
        element: <InvestmentMemosPage />
      },
      {
        path: '/investor/requests',
        element: <RequestsPage role="Investor" />
      }
    ]
  },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/account',
        element: <AccountPage />
      },
      {
        path: '/account/security',
        element: <SecurityPage />
      },
      {
        path: '/notifications',
        element: <NotificationsPage />
      }
    ]
  }
]);
