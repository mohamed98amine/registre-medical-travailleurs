import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, 
  Building2, 
  Stethoscope, 
  Bell, 
  Search, 
  Settings, 
  User,
  ChevronDown,
  Heart,
  Shield,
  Activity
} from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  if (!user) return null;

  const getRoleIcon = () => {
    switch (user.role) {
      case 'EMPLOYEUR':
        return <Building2 className="h-5 w-5" />;
      case 'MEDECIN':
        return <Stethoscope className="h-5 w-5" />;
      case 'DIRECTEUR_REGIONAL':
        return <Shield className="h-5 w-5" />;
      case 'CHEF_DE_ZONE':
        return <Activity className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleBadgeStyles = () => {
    switch (user.role) {
      case 'EMPLOYEUR':
        return 'badge-medical-info';
      case 'MEDECIN':
        return 'badge-medical-success';
      case 'DIRECTEUR_REGIONAL':
        return 'badge-medical-warning';
      case 'CHEF_DE_ZONE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'badge-medical-info';
    }
  };

  const formatRole = (role: string) => {
    return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <header className="medical-header-glass sticky top-0 z-50 border-b border-gray-200/30">
      <div className="max-w-full mx-auto px-6 h-20">
        <div className="flex items-center justify-between h-full">
          
          {/* Logo et branding médical */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {/* Logo principal */}
              <div className="relative">
                <div className="w-12 h-12 gradient-medical-primary rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <Heart className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse-health"></div>
              </div>
              
              {/* Titre */}
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                  MediTrack Pro
                </h1>
                <p className="text-sm text-gray-600 font-medium">
                  Registre Médical Électronique • Burkina Faso
                </p>
              </div>
            </div>

            {/* Badge de rôle */}
            <div className={`badge-medical ${getRoleBadgeStyles()} hidden lg:flex`}>
              <div className="mr-2">
                {getRoleIcon()}
              </div>
              <span className="font-semibold">
                {formatRole(user.role || '')}
              </span>
            </div>
          </div>

          {/* Barre de recherche centrale */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="form-input-medical pl-10 pr-4 py-3 w-full"
                placeholder="Rechercher un patient, médecin, entreprise..."
              />
            </div>
          </div>

          {/* Actions et profil utilisateur */}
          <div className="flex items-center space-x-4">
            
            {/* Recherche mobile */}
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
              <Search className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors focus-medical"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold animate-pulse">
                  3
                </span>
              </button>

              {/* Menu notifications */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 medical-card animate-slide-in-medical z-50">
                  <div className="medical-card-header">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="medical-card-body">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Nouvelle visite programmée</p>
                          <p className="text-xs text-gray-600">Il y a 5 minutes</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Rapport médical prêt</p>
                          <p className="text-xs text-gray-600">Il y a 1 heure</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Certificat à renouveler</p>
                          <p className="text-xs text-gray-600">Il y a 2 heures</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <button className="text-sm text-medical-primary hover:text-blue-700 font-medium">
                        Voir toutes les notifications
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Paramètres */}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors focus-medical">
              <Settings className="h-5 w-5" />
            </button>

            {/* Profil utilisateur */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors focus-medical"
              >
                <div className="w-10 h-10 gradient-medical-primary rounded-xl flex items-center justify-center text-white font-semibold shadow-lg">
                  {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {user.nom} {user.prenom}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatRole(user.role || '')}
                  </div>
                </div>
                <ChevronDown className="hidden sm:block h-4 w-4 text-gray-500" />
              </button>

              {/* Menu utilisateur */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 medical-card animate-slide-in-medical z-50">
                  <div className="medical-card-header">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 gradient-medical-primary rounded-xl flex items-center justify-center text-white font-semibold">
                        {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.nom} {user.prenom}
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="medical-card-body">
                    <div className="space-y-2">
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <User className="h-4 w-4" />
                        <span>Mon profil</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <Settings className="h-4 w-4" />
                        <span>Paramètres</span>
                      </button>
                      <div className="border-t border-gray-100 pt-2 mt-2">
                        <button
                          onClick={logout}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Se déconnecter</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay pour fermer les menus */}
      {(showUserMenu || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;