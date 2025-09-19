import React from 'react';
import { NavLink } from 'react-router-dom';
import { Building2, Users, CalendarDays, Stethoscope, BarChart3, FileText, UserCheck, MapPin, Navigation, Map, ClipboardList } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const linkBase = 'flex items-center gap-2 px-3 py-2 rounded text-sm';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const renderEmployeurLinks = () => (
    <>
      <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <BarChart3 className="h-4 w-4" /> Tableau de bord
      </NavLink>
      <NavLink to="/entreprises/nouvelle" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <Building2 className="h-4 w-4" /> Créer une entreprise
      </NavLink>
      <NavLink to="/demande-affiliation" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <FileText className="h-4 w-4" /> Demande d'affiliation
      </NavLink>
      <NavLink to="/mes-demandes-affiliation" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <ClipboardList className="h-4 w-4" /> Mes demandes
      </NavLink>
      <NavLink to="/travailleurs" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <Users className="h-4 w-4" /> Travailleurs
      </NavLink>
      <NavLink to="/visites-medicales" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <CalendarDays className="h-4 w-4" /> Visites médicales
      </NavLink>
      <NavLink to="/demandes-visite" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <CalendarDays className="h-4 w-4" /> Demandes de visite
      </NavLink>
    </>
  );

  const renderMedecinLinks = () => (
    <>
      <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <BarChart3 className="h-4 w-4" /> Tableau de bord
      </NavLink>
      <NavLink to="/travailleurs" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <Users className="h-4 w-4" /> Travailleurs
      </NavLink>
      <NavLink to="/visites-medicales" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <Stethoscope className="h-4 w-4" /> Mes consultations
      </NavLink>
    </>
  );

  const renderDirecteurRegionalLinks = () => (
    <>
      <NavLink to="/dashboard" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <BarChart3 className="h-4 w-4" /> Tableau de bord
      </NavLink>
      <NavLink to="/demandes-affiliation" className={({ isActive }) => `${linkBase} ${isActive || window.location.pathname.startsWith('/demandes-affiliation') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <Building2 className="h-4 w-4" /> Demandes d'affiliation
      </NavLink>
      <NavLink to="/contrats" className={({ isActive }) => `${linkBase} ${isActive || window.location.pathname.startsWith('/contrats') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <FileText className="h-4 w-4" /> Gestion des contrats
      </NavLink>
      <NavLink to="/entreprises-affiliees" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <UserCheck className="h-4 w-4" /> Entreprises affiliées
      </NavLink>
      <NavLink to="/zones-assignment" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <MapPin className="h-4 w-4" /> Assignation Zones
      </NavLink>
      <NavLink to="/zones-gps" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <Navigation className="h-4 w-4" /> Zones GPS
      </NavLink>
      <NavLink to="/carte-burkina" className={({ isActive }) => `${linkBase} ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}>
        <Map className="h-4 w-4" /> Carte Burkina Faso
      </NavLink>
    </>
  );

  return (
    <aside className="hidden md:block w-60 shrink-0 bg-white border-r h-[calc(100vh-56px)] sticky top-14">
      <nav className="p-3 space-y-1">
        {user.role === 'EMPLOYEUR' && renderEmployeurLinks()}
        {user.role === 'MEDECIN' && renderMedecinLinks()}
        {user.role === 'DIRECTEUR_REGIONAL' && renderDirecteurRegionalLinks()}
      </nav>
    </aside>
  );
};

export default Sidebar;
