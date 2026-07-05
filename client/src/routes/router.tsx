import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from '../components/chrome/AppShell';
import { ForgotPasswordScreen } from '../features/auth/ForgotPasswordScreen';
import { LoginScreen } from '../features/auth/LoginScreen';
import { ResetPasswordScreen } from '../features/auth/ResetPasswordScreen';
import { SignupScreen } from '../features/auth/SignupScreen';
import { CompareScreen } from '../features/compare/CompareScreen';
import { HomeDetailLayout } from '../features/homeDetail/HomeDetailLayout';
import { NearbyTab } from '../features/homeDetail/NearbyTab';
import { Overview } from '../features/homeDetail/Overview';
import { PartnerTab } from '../features/homeDetail/PartnerTab';
import { RenoTab } from '../features/homeDetail/RenoTab';
import { VisitTab } from '../features/homeDetail/VisitTab';
import { HomesList } from '../features/homes/HomesList';
import { OnboardingWizard } from '../features/onboarding/OnboardingWizard';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { VisitModeFlow } from '../features/visitMode/VisitModeFlow';
import { Dashboard } from '../features/seller/Dashboard';
import { Market } from '../features/seller/Market';
import { Buyers } from '../features/seller/Buyers';
import { Improve } from '../features/seller/Improve';
import { ModeRedirect } from './ModeRedirect';
import { RequireAuth } from './RequireAuth';
import { VisitEntry } from './VisitEntry';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginScreen /> },
  { path: '/signup', element: <SignupScreen /> },
  { path: '/forgot-password', element: <ForgotPasswordScreen /> },
  { path: '/reset-password', element: <ResetPasswordScreen /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <AppShell />,
        children: [
          { index: true, element: <ModeRedirect /> },
          { path: 'buy/homes', element: <HomesList /> },
          {
            path: 'buy/homes/:propertyId',
            element: <HomeDetailLayout />,
            children: [
              { index: true, element: <Overview /> },
              { path: 'visit', element: <VisitTab /> },
              { path: 'partner', element: <PartnerTab /> },
              { path: 'reno', element: <RenoTab /> },
              { path: 'nearby', element: <NearbyTab /> },
            ],
          },
          { path: 'buy/visit', element: <VisitEntry /> },
          { path: 'buy/visit/:propertyId', element: <VisitModeFlow /> },
          { path: 'buy/compare', element: <CompareScreen /> },
          { path: 'buy/profile', element: <ProfileScreen /> },
          { path: 'buy/onboarding', element: <OnboardingWizard /> },
          { path: 'sell/dashboard', element: <Dashboard /> },
          { path: 'sell/market', element: <Market /> },
          { path: 'sell/buyers', element: <Buyers /> },
          { path: 'sell/improve', element: <Improve /> },
        ],
      },
    ],
  },
]);
