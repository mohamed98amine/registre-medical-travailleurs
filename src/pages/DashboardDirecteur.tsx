import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { localStorageService } from '../services/localStorage';
import DemandesAffiliationList from './DemandesAffiliationList';
import ContratsDirecteur from './ContratsDirecteur';
import { 
  Building2, 
  FileText, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Plus,
  Eye,
  // Edit,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  total: number;
  nouvelles: number;
  enCours: number;
  validees: number;
  rejetees: number;
  entreprisesAssignees: number;
}

interface ContratStats {
  totalContrats: number;
  chiffreAffairesTotal: number;
}

interface DemandeAffiliation {
  id: number;
  raisonSociale: string;
  secteurActivite: string;
  effectif: number;
  statut: 'NOUVELLE' | 'EN_COURS' | 'VALIDEE' | 'REJETEE';
  dateCreation: string;
  contactDrh: string;
}

interface Contrat {
  id: number;
  numeroContrat: string;
  dateSignature: string;
  tarifAnnuel: number;
  actif: boolean;
  demandeAffiliation: {
    raisonSociale: string;
    effectif: number;
  };
}

const DashboardDirecteur: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'demandes' | 'contrats'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    nouvelles: 0,
    enCours: 0,
    validees: 0,
    rejetees: 0,
    entreprisesAssignees: 0
  });
  const [contratStats, setContratStats] = useState<ContratStats>({
    totalContrats: 0,
    chiffreAffairesTotal: 0
  });
  const [recentDemandes, setRecentDemandes] = useState<DemandeAffiliation[]>([]);
  const [recentContrats, setRecentContrats] = useState<Contrat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fonction pour rafraîchir les données
  const refreshDashboard = () => {
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Récupérer les statistiques des demandes
      try {
        const statsResponse = await fetch('http://localhost:8080/api/demandes-affiliation/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          // Calculer le nombre d'entreprises assignées depuis le compteur
          const entreprisesAssignees = localStorageService.getAssignmentCounter();
          console.log('Compteur d\'assignations:', entreprisesAssignees); // Debug
          setStats({
            ...statsData,
            entreprisesAssignees
          });
        } else {
          console.error('Erreur stats demandes:', statsResponse.status);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stats demandes:', error);
      }

      // Récupérer les statistiques des contrats
      try {
        const contratStatsResponse = await fetch('http://localhost:8080/api/contrats/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (contratStatsResponse.ok) {
          const contratStatsData = await contratStatsResponse.json();
          setContratStats(contratStatsData);
        } else {
          console.error('Erreur stats contrats:', contratStatsResponse.status);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stats contrats:', error);
      }

      // Récupérer les demandes récentes
      try {
        const demandesResponse = await fetch('http://localhost:8080/api/demandes-affiliation', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (demandesResponse.ok) {
          const demandesData = await demandesResponse.json();
          setRecentDemandes(Array.isArray(demandesData) ? demandesData.slice(0, 5) : []); // 5 plus récentes
        } else {
          console.error('Erreur demandes récentes:', demandesResponse.status);
          setRecentDemandes([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des demandes récentes:', error);
        setRecentDemandes([]);
      }

      // Récupérer les contrats récents
      try {
        const contratsResponse = await fetch('http://localhost:8080/api/contrats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (contratsResponse.ok) {
          const contratsData = await contratsResponse.json();
          // Filtrer les contrats valides avec demandeAffiliation
          const validContrats = (Array.isArray(contratsData) ? contratsData : []).filter(contrat =>
            contrat && contrat.demandeAffiliation && contrat.demandeAffiliation.raisonSociale
          );
          setRecentContrats(validContrats.slice(0, 5)); // 5 plus récents
        } else {
          console.error('Erreur contrats récents:', contratsResponse.status);
          setRecentContrats([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des contrats récents:', error);
        setRecentContrats([]);
      }

    } catch (error) {
      console.error('Erreur générale lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut: string) => {
    const statusConfig = {
      NOUVELLE: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      EN_COURS: { color: 'bg-yellow-100 text-yellow-800', icon: Eye },
      VALIDEE: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJETEE: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[statut as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {statut.replace('_', ' ')}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Directeur Régional</h1>
              <p className="text-gray-600">Gestion des demandes d'affiliation et des contrats</p>
            </div>
            <button
              onClick={refreshDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
          </div>
          
          {/* Onglets de navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Building2 className="w-4 h-4 mr-2 inline" />
                Tableau de bord
              </button>
              <button
                onClick={() => setActiveTab('demandes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'demandes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 mr-2 inline" />
                Demandes d'Affiliation
              </button>
              <button
                onClick={() => setActiveTab('contrats')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'contrats'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="w-4 h-4 mr-2 inline" />
                Contrats
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Contenu des onglets */}
        {activeTab === 'dashboard' && (
          <>
        {/* Statistiques des demandes */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des Demandes d'Affiliation</h2>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Nouvelles</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.nouvelles}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Eye className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.enCours}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Validées</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.validees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejetées</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejetees}</p>
                </div>
              </div>
            </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <UserCheck className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Entreprises assignées</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.entreprisesAssignees}</p>
                    </div>
                  </div>
                </div>
          </div>
        </div>

        {/* Statistiques des contrats */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des Contrats</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Contrats actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{contratStats.totalContrats}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Chiffre d'affaires total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(contratStats.chiffreAffairesTotal)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/contrats/creation-avance"
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors group"
            >
              <Plus className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold">Créer un Contrat</h4>
              <p className="text-blue-100 text-sm mt-1">Nouveau contrat intelligent</p>
            </Link>
            
            <Link
              to="/demandes-affiliation"
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors group"
            >
              <UserCheck className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold">Demandes d'Affiliation</h4>
              <p className="text-green-100 text-sm mt-1">Traiter les demandes</p>
            </Link>

                <div className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-lg text-center transition-colors group">
                  <Clock className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-semibold">Demandes en Attente</h4>
                  <p className="text-amber-100 text-sm mt-1">{stats.nouvelles + stats.enCours} demande(s) à traiter</p>
                </div>
          </div>
        </div>

        {/* Demandes récentes et contrats récents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demandes récentes */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Demandes récentes</h3>
                <button
                  onClick={() => navigate('/demandes-affiliation')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Voir toutes
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentDemandes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune demande récente</p>
              ) : (
                <div className="space-y-4">
                  {recentDemandes.map((demande) => (
                    <div key={demande.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{demande.raisonSociale}</h4>
                        <p className="text-sm text-gray-600">
                          {demande.effectif} employés • {demande.secteurActivite}
                        </p>
                        <p className="text-xs text-gray-500">{demande.contactDrh}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(demande.statut)}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contrats récents */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Contrats récents</h3>
                <button
                  onClick={() => navigate('/contrats')}
                  className="text-green-600 hover:text-green-800 text-sm font-medium"
                >
                  Voir tous
                </button>
              </div>
            </div>
            <div className="p-6">
              {recentContrats.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun contrat récent</p>
              ) : (
                <div className="space-y-4">
                  {recentContrats.filter(contrat => contrat && contrat.demandeAffiliation).map((contrat) => (
                    <div key={contrat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{contrat.numeroContrat}</h4>
                        <p className="text-sm text-gray-600">{contrat.demandeAffiliation?.raisonSociale || 'N/A'}</p>
                        <p className="text-xs text-gray-500">
                          {contrat.demandeAffiliation?.effectif || 0} employés
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{formatCurrency(contrat.tarifAnnuel)}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          contrat.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {contrat.actif ? 'Actif' : 'Inactif'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(contrat.dateSignature).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === 'demandes' && (
          <DemandesAffiliationList />
        )}

        {activeTab === 'contrats' && (
          <ContratsDirecteur />
        )}
      </div>
    </div>
  );
};

export default DashboardDirecteur;