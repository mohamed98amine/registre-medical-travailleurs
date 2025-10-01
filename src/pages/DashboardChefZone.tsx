import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Calendar,
  Stethoscope,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserCheck,
  TrendingUp,
  Bell
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ZoneStats {
  totalEntreprises: number;
  visitesProgrammees: number;
  visitesRealisees: number;
  visitesEnAttente: number;
  medecinsDisponibles: number;
}

interface Entreprise {
  id: number;
  raisonSociale: string;
  secteurActivite: string;
  effectif: number;
  adresse: string;
  contactDrh: string;
  email: string;
  telephone: string;
  statut: 'ACTIVE' | 'INACTIVE';
  dateAffiliation: string;
}

interface Visite {
  id: number;
  type: 'VMA' | 'VLT';
  entreprise: {
    id: number;
    raisonSociale: string;
  };
  medecin?: {
    id: number;
    nom: string;
    prenom: string;
  };
  dateProgrammee: string;
  statut: 'PROGRAMMEE' | 'REALISEE' | 'ANNULEE' | 'EN_ATTENTE';
  commentaires?: string;
}

interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  telephone: string;
  email: string;
  disponible: boolean;
}

const DashboardChefZone: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<ZoneStats>({
    totalEntreprises: 0,
    visitesProgrammees: 0,
    visitesRealisees: 0,
    visitesEnAttente: 0,
    medecinsDisponibles: 0
  });
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [visites, setVisites] = useState<Visite[]>([]);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour les modales
  const [showAddEntreprise, setShowAddEntreprise] = useState(false);
  const [showScheduleVisite, setShowScheduleVisite] = useState(false);
  const [showAssignMedecin, setShowAssignMedecin] = useState(false);
  const [selectedVisite, setSelectedVisite] = useState<Visite | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Simulation des données (à remplacer par les vrais appels API)
      setStats({
        totalEntreprises: 15,
        visitesProgrammees: 8,
        visitesRealisees: 12,
        visitesEnAttente: 3,
        medecinsDisponibles: 5
      });

      // Données simulées pour les entreprises
      setEntreprises([
        {
          id: 1,
          raisonSociale: 'SONABHY SA',
          secteurActivite: 'Distribution carburants',
          effectif: 245,
          adresse: 'Zone industrielle, Ouagadougou',
          contactDrh: 'Jean OUEDRAOGO',
          email: 'drh@sonabhy.bf',
          telephone: '70123456',
          statut: 'ACTIVE',
          dateAffiliation: '2024-01-15'
        },
        {
          id: 2,
          raisonSociale: 'CFAO Motors Burkina',
          secteurActivite: 'Automobile',
          effectif: 89,
          adresse: 'Avenue Kwame Nkrumah, Ouagadougou',
          contactDrh: 'Marie KABORE',
          email: 'rh@cfaomotors.bf',
          telephone: '70234567',
          statut: 'ACTIVE',
          dateAffiliation: '2024-02-20'
        }
      ]);

      // Données simulées pour les visites
      setVisites([
        {
          id: 1,
          type: 'VMA',
          entreprise: { id: 1, raisonSociale: 'SONABHY SA' },
          medecin: { id: 1, nom: 'TRAORE', prenom: 'Amadou' },
          dateProgrammee: '2024-09-25',
          statut: 'PROGRAMMEE',
          commentaires: 'Visite annuelle de routine'
        },
        {
          id: 2,
          type: 'VLT',
          entreprise: { id: 2, raisonSociale: 'CFAO Motors Burkina' },
          dateProgrammee: '2024-09-28',
          statut: 'EN_ATTENTE',
          commentaires: 'Contrôle des conditions de travail'
        }
      ]);

      // Données simulées pour les médecins
      setMedecins([
        {
          id: 1,
          nom: 'TRAORE',
          prenom: 'Amadou',
          specialite: 'Médecine du travail',
          telephone: '70345678',
          email: 'a.traore@ost.bf',
          disponible: true
        },
        {
          id: 2,
          nom: 'KONATE',
          prenom: 'Fatou',
          specialite: 'Médecine générale',
          telephone: '70456789',
          email: 'f.konate@ost.bf',
          disponible: true
        }
      ]);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

      // Fonction pour ajouter un médecin
      const handleAddMedecin = () => {
        navigate('/medecins/nouveau');
      };

      // Fonction pour ajouter une entreprise
      const handleAddEntreprise = () => {
        navigate('/entreprises/nouvelle');
      };


  const getStatusBadge = (statut: string, type: 'entreprise' | 'visite' = 'entreprise') => {
    if (type === 'entreprise') {
      if (statut === 'ACTIVE') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        );
      } else if (statut === 'INACTIVE') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Clock className="w-3 h-3 mr-1" />
            Inactive
          </span>
        );
      }
    } else if (type === 'visite') {
      if (statut === 'PROGRAMMEE') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Calendar className="w-3 h-3 mr-1" />
            Programmée
          </span>
        );
      } else if (statut === 'REALISEE') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Réalisée
          </span>
        );
      } else if (statut === 'ANNULEE') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Annulée
          </span>
        );
      } else if (statut === 'EN_ATTENTE') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </span>
        );
      }
    }

    // Default fallback
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <Clock className="w-3 h-3 mr-1" />
        {statut}
      </span>
    );
  };

  const handleScheduleVisite = (entreprise: Entreprise) => {
    setSelectedVisite(null);
    setShowScheduleVisite(true);
  };

  const handleAssignMedecin = (visite: Visite) => {
    setSelectedVisite(visite);
    setShowAssignMedecin(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Dashboard Chef de Zone Médicale
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Tableau de bord unifié - Statistiques et gestion de votre zone
              </p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Actualiser</span>
              <span className="sm:hidden">Rafraîchir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal - Dashboard unifié */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Statistiques principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Entreprises affiliées</p>
                <p className="text-3xl font-bold">{stats.totalEntreprises}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Visites réalisées</p>
                <p className="text-3xl font-bold">{stats.visitesRealisees}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Visites programmées</p>
                <p className="text-3xl font-bold">{stats.visitesProgrammees}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Médecins disponibles</p>
                <p className="text-3xl font-bold">{stats.medecinsDisponibles}</p>
              </div>
              <Stethoscope className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Actions Rapides</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={handleAddEntreprise}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center transition-colors group"
            >
              <Building2 className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold">Ajouter Entreprise</h4>
              <p className="text-blue-100 text-sm mt-1">Nouvelle affiliation</p>
            </button>

            <button
              onClick={handleAddMedecin}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-lg text-center transition-colors group"
            >
              <Stethoscope className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold">Ajouter Médecin</h4>
              <p className="text-emerald-100 text-sm mt-1">Nouveau médecin</p>
            </button>

            <button
              onClick={() => navigate('/visites-medicales')}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center transition-colors group"
            >
              <Calendar className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold">Visites Médicales</h4>
              <p className="text-green-100 text-sm mt-1">Gérer les visites</p>
            </button>

            <button
              onClick={() => navigate('/medecins')}
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center transition-colors group"
            >
              <Stethoscope className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold">Médecins</h4>
              <p className="text-purple-100 text-sm mt-1">Gérer médecins</p>
            </button>
          </div>
        </div>

        {/* Notifications importantes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications Importantes</h2>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900">Visite médicale urgente</h4>
                  <p className="text-red-700 text-sm mt-1">
                    La visite médicale chez SONABHY SA prévue pour aujourd'hui nécessite votre attention.
                  </p>
                  <p className="text-red-600 text-xs mt-2">Il y a 2 heures</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Nouvelle demande d'affiliation</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    3 nouvelles entreprises ont soumis leur demande d'affiliation cette semaine.
                  </p>
                  <p className="text-blue-600 text-xs mt-2">Il y a 4 heures</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Activités Récentes</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Visite médicale programmée</h4>
                <p className="text-sm text-gray-600">SONABHY SA - 25 septembre 2024</p>
              </div>
              <span className="text-xs text-gray-500">Il y a 2h</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Médecin assigné</h4>
                <p className="text-sm text-gray-600">Dr. TRAORE Amadou à CFAO Motors</p>
              </div>
              <span className="text-xs text-gray-500">Il y a 4h</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Nouvelle entreprise affiliée</h4>
                <p className="text-sm text-gray-600">TechCorp Burkina Faso</p>
              </div>
              <span className="text-xs text-gray-500">Il y a 1j</span>
            </div>
          </div>
        </div>

        {/* Graphiques et analyses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité mensuelle</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                <p>Graphique d'activité</p>
                <p className="text-sm">Données en cours de chargement...</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par secteur</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Industrie</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <span className="text-sm font-medium">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Services</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Commerce</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <span className="text-sm font-medium">10%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardChefZone;