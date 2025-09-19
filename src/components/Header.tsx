import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Building2, Stethoscope } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75 border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user.role === 'EMPLOYEUR' ? (
            <Building2 className="h-6 w-6 text-blue-600" />
          ) : (
            <Stethoscope className="h-6 w-6 text-green-600" />
          )}
          <span className="font-semibold text-gray-900">Registre Médical</span>
          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${
            user.role === 'EMPLOYEUR' 
              ? 'bg-blue-50 text-blue-700 border-blue-100' 
              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            {user.role?.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right leading-tight">
            <div className="text-sm text-gray-900 font-medium">{user.nom} {user.prenom}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;