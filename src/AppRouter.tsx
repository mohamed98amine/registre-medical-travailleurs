import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAuth } from './contexts/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardEmployeur from './pages/DashboardEmployeur';
import DashboardMedecin from './pages/DashboardMedecin';
import DashboardDirecteur from './pages/DashboardDirecteur';
import DemandesAffiliationList from './pages/DemandesAffiliationList';
import ContratCreation from './pages/ContratCreation';
import ContratsList from './pages/ContratsList';
import ContratAmendment from './pages/ContratAmendment';
import EntreprisesAffiliees from './pages/EntreprisesAffiliees';
import DemandeAffiliationDetail from './pages/DemandeAffiliationDetail';
import ContratCreationAvance from './pages/ContratCreationAvance';
import ZoneAssignment from './pages/ZoneAssignment';
import GestionZonesGPS from './pages/GestionZonesGPS';
import CarteZonesBurkinaFaso from './pages/CarteZonesBurkinaFaso';
import TravailleursList from './pages/TravailleursList';
import TravailleurForm from './pages/TravailleurForm';
import VisitesMedicalesList from './pages/VisitesMedicalesList.tsx';
import VisiteMedicaleForm from './pages/VisiteMedicaleForm';
import EntrepriseForm from './pages/EntrepriseForm';
import DemandeVisiteForm from './pages/DemandeVisiteForm';
import DemandesVisiteList from './pages/DemandesVisiteList';
import DemandeAffiliationEmployeur from './pages/DemandeAffiliationEmployeur';
import MesDemandesAffiliation from './pages/MesDemandesAffiliation';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RoleDashboard: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'MEDECIN') {
    return <DashboardMedecin />;
  }
  if (user?.role === 'DIRECTEUR_REGIONAL') {
    return <DashboardDirecteur />;
  }
  return <DashboardEmployeur />;
};

// Layout pour les pages publiques (sans sidebar)
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <Toaster position="top-right" />
    </div>
  );
};

// Layout pour les pages privées (avec header et sidebar)
const PrivateLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 flex gap-4">
        <Sidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

const AppRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Routes>
            {/* Routes publiques */}
            <Route path="/" element={
              <PublicLayout>
                <LandingPage />
              </PublicLayout>
            } />
            <Route path="/login" element={
              <PublicLayout>
                <LoginPage />
              </PublicLayout>
            } />
            <Route path="/register" element={
              <PublicLayout>
                <RegisterPage />
              </PublicLayout>
            } />
            
            {/* Routes protégées */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <PrivateLayout>
                    <RoleDashboard />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard-medecin" 
              element={
                <ProtectedRoute allowedRoles={['MEDECIN']}>
                  <PrivateLayout>
                    <DashboardMedecin />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/travailleurs" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR', 'MEDECIN']}>
                  <PrivateLayout>
                    <TravailleursList />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/travailleurs/nouveau" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                  <PrivateLayout>
                    <TravailleurForm />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/travailleurs/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                  <PrivateLayout>
                    <TravailleurForm />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/visites-medicales" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR', 'MEDECIN']}>
                  <PrivateLayout>
                    <VisitesMedicalesList />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/visites-medicales/nouvelle" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                  <PrivateLayout>
                    <VisiteMedicaleForm />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/visites-medicales/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR', 'MEDECIN']}>
                  <PrivateLayout>
                    <VisiteMedicaleForm />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/entreprises/nouvelle" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                  <PrivateLayout>
                    <EntrepriseForm />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/entreprises/:id/edit" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                  <PrivateLayout>
                    <EntrepriseForm />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/demandes-visite" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                  <PrivateLayout>
                    <DemandesVisiteList />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />

            {/* Routes pour demandes d'affiliation (Employeurs) */}
            <Route 
              path="/demande-affiliation" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                  <PrivateLayout>
                    <DemandeAffiliationEmployeur />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route
              path="/mes-demandes-affiliation"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                  <PrivateLayout>
                    <MesDemandesAffiliation />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/contrat-creation"
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                  <PrivateLayout>
                    <ContratCreation />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/demande-affiliation/:id" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                  <PrivateLayout>
                    <MesDemandesAffiliation />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/demandes-visite/nouvelle" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                  <PrivateLayout>
                    <DemandeVisiteForm />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Routes Directeur Régional */}
            <Route 
              path="/dashboard-directeur" 
              element={
                <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL']}>
                  <PrivateLayout>
                    <DashboardDirecteur />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/demandes-affiliation" 
              element={
                <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL']}>
                  <PrivateLayout>
                    <DemandesAffiliationList />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/contrats" 
              element={
                <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL']}>
                  <PrivateLayout>
                    <ContratsList />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/contrats/nouveau" 
              element={
                <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL']}>
                  <PrivateLayout>
                    <ContratCreation />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/contrats/:id/amender" 
              element={
                <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL']}>
                  <PrivateLayout>
                    <ContratAmendment />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
          <Route
            path="/entreprises-affiliees"
            element={
              <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL']}>
                <PrivateLayout>
                  <EntreprisesAffiliees />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/demandes-affiliation/:id"
            element={
              <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL']}>
                <PrivateLayout>
                  <DemandeAffiliationDetail />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contrats/creation-avance"
            element={
              <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL']}>
                <PrivateLayout>
                  <ContratCreationAvance />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/zones-assignment"
            element={
              <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL']}>
                <PrivateLayout>
                  <ZoneAssignment />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/zones-gps"
            element={
              <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL']}>
                <PrivateLayout>
                  <GestionZonesGPS />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/carte-burkina"
            element={
              <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL']}>
                <PrivateLayout>
                  <CarteZonesBurkinaFaso />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />
            
            {/* Route par défaut */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);
};

export default AppRouter;