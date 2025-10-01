import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  CalendarDays, 
  Stethoscope, 
  BarChart3, 
  FileText, 
  UserCheck, 
  MapPin, 
  Navigation, 
  Map, 
  ClipboardList,
  Bell,
  Clock,
  FolderOpen,
  Award,
  Activity,
  Heart,
  Shield,
  TrendingUp,
  Clipboard,
  Calendar,
  UserPlus,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  // Styles médicaux modernes
  const linkBase = 'nav-link-medical gap-3 text-gray-700 hover:text-gray-900';
  const activeLink = 'nav-link-medical-active text-white';
  const inactiveLink = 'text-gray-700 hover:bg-gray-50 hover:text-gray-900';

  // Style pour les sections
  const sectionStyle = 'space-y-1';
  const sectionTitleStyle = 'nav-section-title flex items-center gap-2';

  const renderEmployeurLinks = () => (
    <div className={sectionStyle}>
      {/* Vue d'ensemble */}
      <div className={sectionTitleStyle}>
        <TrendingUp className="h-4 w-4 text-blue-500" />
        <span>Vue d'ensemble</span>
      </div>
      
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <BarChart3 className="h-5 w-5 flex-shrink-0" />
        <span>Tableau de bord</span>
      </NavLink>

      <NavLink 
        to="/travailleurs" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Users className="h-5 w-5 flex-shrink-0" />
        <span>Mes Travailleurs</span>
        <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">12</span>
      </NavLink>
      
      {/* Gestion Entreprise */}
      <div className={sectionTitleStyle}>
        <Building2 className="h-4 w-4 text-indigo-500" />
        <span>Gestion Entreprise</span>
      </div>
      
      <NavLink 
        to="/entreprises/nouvelle" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <UserPlus className="h-5 w-5 flex-shrink-0" />
        <span>Nouvelle Entreprise</span>
      </NavLink>
      
      <NavLink 
        to="/demande-affiliation" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <FileText className="h-5 w-5 flex-shrink-0" />
        <span>Demande d'Affiliation</span>
      </NavLink>
      
      <NavLink 
        to="/mes-demandes-affiliation" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Clipboard className="h-5 w-5 flex-shrink-0" />
        <span>Mes Demandes</span>
        <span className="ml-auto bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">3</span>
      </NavLink>
      
      {/* Santé au Travail */}
      <div className={sectionTitleStyle}>
        <Heart className="h-4 w-4 text-green-500" />
        <span>Santé au Travail</span>
      </div>
      
      <NavLink 
        to="/visites-medicales" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <CalendarDays className="h-5 w-5 flex-shrink-0" />
        <span>Visites Médicales</span>
      </NavLink>
      
      <NavLink 
        to="/demandes-visite" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Calendar className="h-5 w-5 flex-shrink-0" />
        <span>Programmer Visite</span>
      </NavLink>
      
      <NavLink 
        to="/certificats" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Award className="h-5 w-5 flex-shrink-0" />
        <span>Certificats Médicaux</span>
      </NavLink>
      
      {/* Communication */}
      <div className={sectionTitleStyle}>
        <Bell className="h-4 w-4 text-purple-500" />
        <span>Communication</span>
      </div>
      
      <NavLink 
        to="/notifications-employeur" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Bell className="h-5 w-5 flex-shrink-0" />
        <span>Notifications</span>
        <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">5</span>
      </NavLink>

      <NavLink 
        to="/mes-demandes-employeur" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <ClipboardList className="h-5 w-5 flex-shrink-0" />
        <span>Mes Demandes</span>
      </NavLink>
    </div>
  );

  const renderMedecinLinks = () => (
    <div className={sectionStyle}>
      {/* Vue d'ensemble */}
      <div className={sectionTitleStyle}>
        <TrendingUp className="h-4 w-4 text-blue-500" />
        <span>Vue d'ensemble</span>
      </div>
      
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <BarChart3 className="h-5 w-5 flex-shrink-0" />
        <span>Tableau de bord</span>
      </NavLink>
      
      {/* Consultations Médicales */}
      <div className={sectionTitleStyle}>
        <Stethoscope className="h-4 w-4 text-green-500" />
        <span>Consultations</span>
      </div>
      
      <NavLink 
        to="/mes-consultations" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Activity className="h-5 w-5 flex-shrink-0" />
        <span>Mes Consultations</span>
        <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">8</span>
      </NavLink>
      
      <NavLink 
        to="/disponibilite-medecin" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Clock className="h-5 w-5 flex-shrink-0" />
        <span>Planning & Disponibilité</span>
      </NavLink>
      
      {/* Patients et Dossiers */}
      <div className={sectionTitleStyle}>
        <FolderOpen className="h-4 w-4 text-indigo-500" />
        <span>Patients & Dossiers</span>
      </div>
      
      <NavLink 
        to="/travailleurs" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Users className="h-5 w-5 flex-shrink-0" />
        <span>Mes Patients</span>
      </NavLink>
      
      <NavLink 
        to="/entreprises-medecin" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Building2 className="h-5 w-5 flex-shrink-0" />
        <span>Entreprises Affiliées</span>
      </NavLink>
      
      {/* Documents Médicaux */}
      <div className={sectionTitleStyle}>
        <Award className="h-4 w-4 text-purple-500" />
        <span>Documents</span>
      </div>
      
      <NavLink 
        to="/certificats" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Award className="h-5 w-5 flex-shrink-0" />
        <span>Certificats Médicaux</span>
      </NavLink>
      
      {/* Communication */}
      <div className={sectionTitleStyle}>
        <Bell className="h-4 w-4 text-orange-500" />
        <span>Communication</span>
      </div>
      
      <NavLink 
        to="/notifications" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Bell className="h-5 w-5 flex-shrink-0" />
        <span>Notifications</span>
        <span className="ml-auto bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">12</span>
      </NavLink>
    </div>
  );

  const renderDirecteurRegionalLinks = () => (
    <div className={sectionStyle}>
      {/* Administration */}
      <div className={sectionTitleStyle}>
        <Shield className="h-4 w-4 text-blue-500" />
        <span>Administration</span>
      </div>
      
      <NavLink 
        to="/dashboard" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <BarChart3 className="h-5 w-5 flex-shrink-0" />
        <span>Tableau de bord</span>
      </NavLink>
      
      {/* Gestion des Affiliations */}
      <div className={sectionTitleStyle}>
        <Building2 className="h-4 w-4 text-indigo-500" />
        <span>Affiliations</span>
      </div>
      
      <NavLink 
        to="/demandes-affiliation" 
        className={({ isActive }) => `${linkBase} ${isActive || location.pathname.startsWith('/demandes-affiliation') ? activeLink : inactiveLink}`}
      >
        <Clipboard className="h-5 w-5 flex-shrink-0" />
        <span>Demandes d'Affiliation</span>
        <span className="ml-auto bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">15</span>
      </NavLink>
      
      <NavLink 
        to="/contrats" 
        className={({ isActive }) => `${linkBase} ${isActive || location.pathname.startsWith('/contrats') ? activeLink : inactiveLink}`}
      >
        <FileText className="h-5 w-5 flex-shrink-0" />
        <span>Gestion des Contrats</span>
      </NavLink>
      
      <NavLink 
        to="/entreprises-affiliees" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <UserCheck className="h-5 w-5 flex-shrink-0" />
        <span>Entreprises Affiliées</span>
        <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">142</span>
      </NavLink>
      
      {/* Gestion Territoriale */}
      <div className={sectionTitleStyle}>
        <Map className="h-4 w-4 text-green-500" />
        <span>Gestion Territoriale</span>
      </div>
      
      <NavLink 
        to="/zones-assignment" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <MapPin className="h-5 w-5 flex-shrink-0" />
        <span>Assignation des Zones</span>
      </NavLink>
      
      <NavLink 
        to="/zones-gps" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Navigation className="h-5 w-5 flex-shrink-0" />
        <span>Zones GPS</span>
      </NavLink>
      
      <NavLink 
        to="/carte-burkina" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Map className="h-5 w-5 flex-shrink-0" />
        <span>Carte du Burkina Faso</span>
      </NavLink>
    </div>
  );

  const renderChefZoneLinks = () => (
    <div className={sectionStyle}>
      {/* Supervision */}
      <div className={sectionTitleStyle}>
        <Activity className="h-4 w-4 text-blue-500" />
        <span>Supervision</span>
      </div>
      
      <NavLink 
        to="/dashboard-chef-zone" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <BarChart3 className="h-5 w-5 flex-shrink-0" />
        <span>Tableau de bord</span>
      </NavLink>
      
      {/* Gestion des Ressources */}
      <div className={sectionTitleStyle}>
        <Users className="h-4 w-4 text-green-500" />
        <span>Gestion des Ressources</span>
      </div>
      
      <NavLink
        to="/medecins"
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Stethoscope className="h-5 w-5 flex-shrink-0" />
        <span>Équipe Médicale</span>
        <span className="ml-auto bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">23</span>
      </NavLink>

      <NavLink
        to="/entreprises"
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Building2 className="h-5 w-5 flex-shrink-0" />
        <span>Entreprises Zone</span>
        <span className="ml-auto bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">87</span>
      </NavLink>

      <NavLink
        to="/employeurs"
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <UserCheck className="h-5 w-5 flex-shrink-0" />
        <span>Employeurs</span>
      </NavLink>
      
      {/* Planification */}
      <div className={sectionTitleStyle}>
        <Calendar className="h-4 w-4 text-purple-500" />
        <span>Planification</span>
      </div>
      
      <NavLink 
        to="/visites-medicales" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <CalendarDays className="h-5 w-5 flex-shrink-0" />
        <span>Visites Médicales</span>
      </NavLink>

      <NavLink
        to="/visites-medicales/nouvelle"
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <UserPlus className="h-5 w-5 flex-shrink-0" />
        <span>Programmer Visite</span>
      </NavLink>
      
      {/* Administration */}
      <div className={sectionTitleStyle}>
        <Settings className="h-4 w-4 text-orange-500" />
        <span>Administration</span>
      </div>
      
      <NavLink 
        to="/demande-affiliation" 
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <FileText className="h-5 w-5 flex-shrink-0" />
        <span>Demandes d'Affiliation</span>
      </NavLink>

      <NavLink
        to="/entreprises/ajouter"
        className={({ isActive }) => `${linkBase} ${isActive ? activeLink : inactiveLink}`}
      >
        <Building2 className="h-5 w-5 flex-shrink-0" />
        <span>Nouvelle Entreprise</span>
      </NavLink>
    </div>
  );

  return (
    <>
      {/* Sidebar Desktop */}
      <aside className="hidden md:block w-72 shrink-0 nav-medical h-[calc(100vh-80px)] sticky top-20 overflow-y-auto">
        <div className="p-6">
          {/* Accès rapide */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Accès Rapide</h3>
              <div className="h-px bg-gray-200 flex-1 ml-3"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="btn-medical-ghost p-3 text-xs">
                <UserPlus className="h-4 w-4 mb-1" />
                Nouveau
              </button>
              <button className="btn-medical-ghost p-3 text-xs">
                <Calendar className="h-4 w-4 mb-1" />
                Planning
              </button>
            </div>
          </div>

          {/* Navigation principale */}
          <nav className="space-y-2">
            {user.role === 'EMPLOYEUR' && renderEmployeurLinks()}
            {user.role === 'MEDECIN' && renderMedecinLinks()}
            {user.role === 'DIRECTEUR_REGIONAL' && renderDirecteurRegionalLinks()}
            {user.role === 'CHEF_DE_ZONE' && renderChefZoneLinks()}
          </nav>

          {/* Section Support */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-2">
              <button className="nav-link-medical text-gray-600 hover:text-gray-900">
                <HelpCircle className="h-5 w-5 flex-shrink-0" />
                <span>Aide & Support</span>
              </button>
              <button className="nav-link-medical text-gray-600 hover:text-gray-900">
                <Settings className="h-5 w-5 flex-shrink-0" />
                <span>Paramètres</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => {
            const mobileMenu = document.getElementById('mobile-sidebar');
            if (mobileMenu) {
              mobileMenu.classList.toggle('hidden');
            }
          }}
          className="w-14 h-14 gradient-medical-primary text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center animate-pulse-health"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        id="mobile-sidebar"
        className="md:hidden fixed inset-0 z-40 hidden"
      >
        <div className="fixed inset-0 bg-black bg-opacity-50 animate-fade-in-medical" onClick={() => {
          const mobileMenu = document.getElementById('mobile-sidebar');
          if (mobileMenu) {
            mobileMenu.classList.add('hidden');
          }
        }}></div>
        
        <div className="fixed right-0 top-0 h-full w-80 medical-card animate-slide-in-medical">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 gradient-medical-primary rounded-xl flex items-center justify-center">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Navigation</h2>
              </div>
              <button
                onClick={() => {
                  const mobileMenu = document.getElementById('mobile-sidebar');
                  if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                  }
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="space-y-2">
              {user.role === 'EMPLOYEUR' && renderEmployeurLinks()}
              {user.role === 'MEDECIN' && renderMedecinLinks()}
              {user.role === 'DIRECTEUR_REGIONAL' && renderDirecteurRegionalLinks()}
              {user.role === 'CHEF_DE_ZONE' && renderChefZoneLinks()}
            </nav>

            {/* Support mobile */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <button className="nav-link-medical text-gray-600 hover:text-gray-900 w-full">
                  <HelpCircle className="h-5 w-5 flex-shrink-0" />
                  <span>Aide & Support</span>
                </button>
                <button className="nav-link-medical text-gray-600 hover:text-gray-900 w-full">
                  <Settings className="h-5 w-5 flex-shrink-0" />
                  <span>Paramètres</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
