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
import VisitesMedicales from './pages/VisitesMedicales';
import VisiteMedicaleForm from './pages/VisiteMedicaleForm';
import EntrepriseForm from './pages/EntrepriseForm';
import DemandeVisiteForm from './pages/DemandeVisiteForm';
import DemandesVisiteList from './pages/DemandesVisiteList';
import DemandeAffiliationEmployeur from './pages/DemandeAffiliationEmployeur';
import MesDemandesAffiliation from './pages/MesDemandesAffiliation';
import DashboardChefZone from './pages/DashboardChefZone';
import MedecinsList from './pages/MedecinsList';
import MedecinForm from './pages/MedecinForm';
import EntreprisesList from './pages/EntreprisesList';
import MedecinEntrepriseAssignment from './pages/MedecinEntrepriseAssignment';
import ProgrammerVisiteUnifie from './pages/ProgrammerVisiteUnifie';
import GestionEmployeurs from './pages/GestionEmployeurs';
import GestionMedecins from './pages/GestionMedecins';
import Notifications from './pages/Notifications';
import SaisieResultats from './pages/SaisieResultats';
import DossierMedical from './pages/DossierMedical';
import DisponibiliteMedecin from './pages/DisponibiliteMedecin';
import Certificats from './pages/Certificats';
import EntreprisesMedecin from './pages/EntreprisesMedecin';
import MedecinsDisponibles from './pages/MedecinsDisponibles';
import MesConsultations from './pages/MesConsultations';
import NotificationsEmployeur from './pages/NotificationsEmployeur';
import MesDemandesEmployeur from './pages/MesDemandesEmployeur';
import CertificatsEmployeur from './pages/CertificatsEmployeur';

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
  if (user?.role === 'CHEF_DE_ZONE') {
    return <DashboardChefZone />;
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
              path="/medecins"
              element={
                <ProtectedRoute allowedRoles={['CHEF_DE_ZONE', 'DIRECTEUR_REGIONAL', 'ADMIN']}>
                  <PrivateLayout>
                    <MedecinsList />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/medecins/nouveau"
              element={
                <ProtectedRoute allowedRoles={['CHEF_DE_ZONE', 'DIRECTEUR_REGIONAL', 'ADMIN']}>
                  <PrivateLayout>
                    <MedecinForm />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/medecins/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['CHEF_DE_ZONE', 'DIRECTEUR_REGIONAL', 'ADMIN']}>
                  <PrivateLayout>
                    <MedecinForm />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/medecins/:id"
              element={
                <ProtectedRoute allowedRoles={['CHEF_DE_ZONE', 'DIRECTEUR_REGIONAL', 'ADMIN']}>
                  <PrivateLayout>
                    <MedecinForm />
                  </PrivateLayout>
                </ProtectedRoute>
              }
            />
            
            <Route 
              path="/assignation-medecin" 
              element={
                <ProtectedRoute allowedRoles={['CHEF_DE_ZONE']}>
                  <PrivateLayout>
                    <MedecinEntrepriseAssignment />
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
                <ProtectedRoute allowedRoles={['EMPLOYEUR', 'MEDECIN', 'CHEF_DE_ZONE']}>
                  <PrivateLayout>
                    <VisitesMedicales />
                  </PrivateLayout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/visites-medicales/nouvelle" 
              element={
                <ProtectedRoute allowedRoles={['EMPLOYEUR', 'CHEF_DE_ZONE']}>
                  <PrivateLayout>
                    <ProgrammerVisiteUnifie />
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
                <ProtectedRoute allowedRoles={['EMPLOYEUR', 'CHEF_DE_ZONE']}>
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
                <ProtectedRoute allowedRoles={['EMPLOYEUR', 'CHEF_DE_ZONE']}>
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
          <Route
            path="/dashboard-chef-zone"
            element={
              <ProtectedRoute allowedRoles={['DIRECTEUR_REGIONAL', 'CHEF_DE_ZONE']}>
                <PrivateLayout>
                  <DashboardChefZone />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />


          {/* Routes pour les entreprises */}
          <Route
            path="/entreprises"
            element={
              <ProtectedRoute allowedRoles={['CHEF_DE_ZONE']}>
                <PrivateLayout>
                  <EntreprisesList />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/entreprises/ajouter"
            element={
              <ProtectedRoute allowedRoles={['CHEF_DE_ZONE']}>
                <PrivateLayout>
                  <EntrepriseForm />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/entreprises/:id/edit"
            element={
              <ProtectedRoute allowedRoles={['CHEF_DE_ZONE']}>
                <PrivateLayout>
                  <EntrepriseForm />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/employeurs"
            element={
              <ProtectedRoute allowedRoles={['CHEF_DE_ZONE']}>
                <PrivateLayout>
                  <GestionEmployeurs />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/gestion-medecins"
            element={
              <ProtectedRoute allowedRoles={['CHEF_DE_ZONE']}>
                <PrivateLayout>
                  <GestionMedecins />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEUR', 'MEDECIN']}>
                <PrivateLayout>
                  <Notifications />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/saisie-resultats/:visiteId"
            element={
              <ProtectedRoute allowedRoles={['MEDECIN']}>
                <PrivateLayout>
                  <SaisieResultats />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dossier-medical/:employeurId"
            element={
              <ProtectedRoute allowedRoles={['MEDECIN']}>
                <PrivateLayout>
                  <DossierMedical />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/disponibilite-medecin"
            element={
              <ProtectedRoute allowedRoles={['MEDECIN']}>
                <PrivateLayout>
                  <DisponibiliteMedecin />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/certificats"
            element={
              <ProtectedRoute allowedRoles={['MEDECIN', 'EMPLOYEUR']}>
                <PrivateLayout>
                  <CertificatsEmployeur />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/entreprises-medecin"
            element={
              <ProtectedRoute allowedRoles={['MEDECIN']}>
                <PrivateLayout>
                  <EntreprisesMedecin />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/chef-zone/medecins-disponibles"
            element={
              <ProtectedRoute allowedRoles={['CHEF_DE_ZONE', 'MEDECIN']}>
                <PrivateLayout>
                  <MedecinsDisponibles />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mes-consultations"
            element={
              <ProtectedRoute allowedRoles={['MEDECIN']}>
                <PrivateLayout>
                  <MesConsultations />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications-employeur"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                <PrivateLayout>
                  <NotificationsEmployeur />
                </PrivateLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/mes-demandes-employeur"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEUR']}>
                <PrivateLayout>
                  <MesDemandesEmployeur />
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