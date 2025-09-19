import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheckIcon, LogOutIcon, HomeIcon, BuildingIcon, UserIcon, CalendarIcon, ClipboardIcon, BellIcon, BarChartIcon } from 'lucide-react';
export function Dashboard() {
  const navigate = useNavigate();
  const handleLogout = () => {
    navigate('/');
  };
  return <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-green-800 text-white fixed h-full">
        <div className="p-4 flex items-center gap-2 border-b border-green-700">
          <div className="bg-white p-1 rounded-md">
            <ShieldCheckIcon className="h-8 w-8 text-[#1f7a3b]" />
          </div>
          <h1 className="text-xl font-bold">OST Burkina</h1>
        </div>
        <nav className="mt-6">
          <div className="px-4 py-2 text-green-300 text-xs font-semibold">
            MENU PRINCIPAL
          </div>
          <a href="#" className="flex items-center px-4 py-3 text-white bg-green-700">
            <HomeIcon className="h-5 w-5 mr-3" />
            Tableau de bord
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-white hover:bg-green-700 transition-colors">
            <BuildingIcon className="h-5 w-5 mr-3" />
            Entreprises
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-white hover:bg-green-700 transition-colors">
            <UserIcon className="h-5 w-5 mr-3" />
            Travailleurs
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-white hover:bg-green-700 transition-colors">
            <CalendarIcon className="h-5 w-5 mr-3" />
            Visites médicales
          </a>
          <a href="#" className="flex items-center px-4 py-3 text-white hover:bg-green-700 transition-colors">
            <ClipboardIcon className="h-5 w-5 mr-3" />
            Rapports
          </a>
          <div className="px-4 py-2 mt-4 text-green-300 text-xs font-semibold">
            PARAMÈTRES
          </div>
          <a href="#" className="flex items-center px-4 py-3 text-white hover:bg-green-700 transition-colors">
            <UserIcon className="h-5 w-5 mr-3" />
            Profil
          </a>
          <button onClick={handleLogout} className="flex items-center px-4 py-3 text-white hover:bg-green-700 transition-colors w-full text-left">
            <LogOutIcon className="h-5 w-5 mr-3" />
            Déconnexion
          </button>
        </nav>
      </div>
      {/* Main Content */}
      <div className="ml-64 flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Tableau de bord
            </h1>
            <div className="flex items-center gap-4">
              <button className="relative">
                <BellIcon className="h-6 w-6 text-gray-500" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700 font-medium">AD</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Admin OST</p>
                  <p className="text-xs text-gray-500">Administrateur</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">
                  Entreprises affiliées
                </h3>
                <div className="bg-green-100 p-2 rounded-lg">
                  <BuildingIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">1,248</p>
              <p className="text-green-600 text-sm mt-2 flex items-center">
                <span>+8% </span>
                <span className="text-gray-500 ml-1">
                  depuis le mois dernier
                </span>
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">
                  Travailleurs enregistrés
                </h3>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">24,351</p>
              <p className="text-green-600 text-sm mt-2 flex items-center">
                <span>+12% </span>
                <span className="text-gray-500 ml-1">
                  depuis le mois dernier
                </span>
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">
                  Visites médicales
                </h3>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">1,856</p>
              <p className="text-green-600 text-sm mt-2 flex items-center">
                <span>+4% </span>
                <span className="text-gray-500 ml-1">
                  depuis le mois dernier
                </span>
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">
                  Taux d'aptitude
                </h3>
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <BarChartIcon className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800">95.4%</p>
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <span>-1.2% </span>
                <span className="text-gray-500 ml-1">
                  depuis le mois dernier
                </span>
              </p>
            </div>
          </div>
          {/* Activity Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-800 mb-6">
              Activités récentes
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-2 rounded-full">
                  <BuildingIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    Nouvelle entreprise affiliée
                  </p>
                  <p className="text-gray-500 text-sm">
                    Société Minière du Burkina - Secteur minier
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-2 rounded-full">
                  <CalendarIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    Visite médicale programmée
                  </p>
                  <p className="text-gray-500 text-sm">
                    BTP Construction - 45 travailleurs
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Il y a 5 heures</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 p-2 rounded-full">
                  <ClipboardIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    Rapport mensuel généré
                  </p>
                  <p className="text-gray-500 text-sm">
                    Statistiques du mois d'Octobre 2023
                  </p>
                  <p className="text-gray-400 text-xs mt-1">Hier à 16:30</p>
                </div>
              </div>
            </div>
          </div>
          {/* Upcoming Visits */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-6">
              Visites médicales à venir
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Entreprise</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Nombre de travailleurs</th>
                    <th className="px-4 py-3">Zone médicale</th>
                    <th className="px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-4 whitespace-nowrap">
                      Société Générale des Travaux
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">15 Nov 2023</td>
                    <td className="px-4 py-4 whitespace-nowrap">32</td>
                    <td className="px-4 py-4 whitespace-nowrap">Zone Centre</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        En attente
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 whitespace-nowrap">
                      Banque Nationale du Burkina
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">18 Nov 2023</td>
                    <td className="px-4 py-4 whitespace-nowrap">78</td>
                    <td className="px-4 py-4 whitespace-nowrap">Zone Sud</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Confirmée
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 whitespace-nowrap">
                      Coton du Faso
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">22 Nov 2023</td>
                    <td className="px-4 py-4 whitespace-nowrap">120</td>
                    <td className="px-4 py-4 whitespace-nowrap">Zone Est</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        En préparation
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>;
}