import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  Users, 
  FileText, 
  Clock, 
  Calendar, 
  Search,
  Eye,
  Plus,
  RefreshCw,
  Edit3,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  Download
} from 'lucide-react';
import { visiteMedicaleAPI, demandeAffiliationAPI } from '../services/api';

const Chip: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
      active 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
        : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-md'
    }`}
  >
    {label}
  </button>
);

const StatCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  color: string; 
  gradient: string;
  change?: string;
}> = ({ icon, title, value, color, gradient, change }) => (
  <div className={`p-6 rounded-2xl ${gradient} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`p-3 rounded-xl ${color} bg-white/20 backdrop-blur-sm`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-2xl font-bold text-white">{value || '-'}</p>
        </div>
      </div>
      {change && (
        <div className="text-right">
          <span className="text-xs text-white/70">{change}</span>
        </div>
      )}
    </div>
  </div>
);

const DashboardEmployeur: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');


  // Données de test pour les autres sections
  const overview = { travailleurs: 12, visitesProgrammees: 5, aptitudes: 8, inaptitudes: 2, visitesEnAttente: 3, visitesARenouveler: 4 };
  const workers = [
    { id: 1, nom: 'OUEDRAOGO', prenom: 'Amine', poste: 'Développeur', aptitude: 'APTE', derniereVisite: '2024-01-15' },
    { id: 2, nom: 'TRAORE', prenom: 'Fatou', poste: 'Designer', aptitude: 'APTE', derniereVisite: '2024-01-10' },
    { id: 3, nom: 'KONE', prenom: 'Ibrahim', poste: 'Manager', aptitude: 'INAPTE', derniereVisite: '2024-01-05' }
  ];
  const upcoming = [
    { id: 1, dateVisite: '2024-01-20', type: 'EMBAUCHE', medecin: { nom: 'Dr. OUEDRAOGO' } },
    { id: 2, dateVisite: '2024-01-22', type: 'PERIODIQUE', medecin: { nom: 'Dr. TRAORE' } }
  ];

  // Récupération des demandes d'affiliation
  const { data: demandesData, isLoading: demandesLoading, error: demandesError } = useQuery({
    queryKey: ['mes-demandes-affiliation'],
    queryFn: () => demandeAffiliationAPI.getMy().then(r => r.data),
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Traitement sécurisé des données d'affiliation
  const demandesAffiliation = useMemo(() => {
    if (Array.isArray(demandesData)) {
      return demandesData;
    }
    if (demandesData && typeof demandesData === 'object' && 'data' in demandesData && Array.isArray((demandesData as any).data)) {
      return (demandesData as any).data;
    }
    // Retourner un tableau vide si pas de données
    return [];
  }, [demandesData]);

  // Récupérer les contrats générés depuis le localStorage (pour l'instant)
  const contratsGeneres = React.useMemo(() => {
    const contrats = [];
    // Récupérer tous les contrats stockés dans localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('contrat_pdf_')) {
        try {
          const contrat = JSON.parse(localStorage.getItem(key) || '{}');
          if (contrat && contrat.numeroContrat) {
            contrats.push(contrat);
          }
        } catch (error) {
          console.error('Erreur lors de la lecture du contrat:', error);
        }
      }
    }
    return contrats;
  }, []);

  const overviewLoading = false;
  const workersLoading = false;
  const upcomingLoading = false;
  const allVisitsLoading = false;

  // Fonction pour télécharger un contrat
  const downloadContrat = (contrat: any) => {
    try {
      const pdfData = atob(contrat.pdfBase64);
      const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = contrat.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  // Fonction pour consulter un contrat
  const viewContrat = (contrat: any) => {
    try {
      const pdfData = atob(contrat.pdfBase64);
      const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Erreur lors de l\'ouverture:', error);
    }
  };
  const overviewError = null;
  const workersError = null;
  const upcomingError = null;
  const allVisitsError = null;

  const [filter, setFilter] = useState<'ALL' | 'APTE' | 'INAPTE' | 'A_RENOUVELER'>('ALL');


  const filtered = useMemo(() => {
    if (!workers || !Array.isArray(workers)) return [];
    let filteredData = [...workers];

    if (filter === 'ALL') filteredData = workers;
    else if (filter === 'A_RENOUVELER') filteredData = workers.filter((w: any) => !w.aptitude);
    else filteredData = workers.filter((w: any) => w.aptitude === filter);

    if (searchTerm) {
      filteredData = filteredData.filter((w: any) =>
        w.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.poste?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredData;
  }, [workers, filter, searchTerm]);

  const isLoading = overviewLoading || workersLoading || upcomingLoading || allVisitsLoading || demandesLoading;
  const hasError = overviewError || workersError || upcomingError || allVisitsError || demandesError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-gray-600">Chargement en cours...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-red-600">Une erreur est survenue. Veuillez réessayer plus tard.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 space-y-8">
      {/* Header avec titre et actions principales */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Tableau de bord Employeur
          </h1>
          <p className="text-gray-600 mt-2">Gérez vos travailleurs et vos visites médicales</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => navigate('/travailleurs/nouveau')} 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un travailleur
          </button>
          <button 
            onClick={() => navigate('/demandes-visite/nouvelle')} 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Nouvelle demande
          </button>
          <button 
            onClick={() => navigate('/demande-affiliation')} 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <FileText className="w-5 h-5 mr-2" />
            Demande d'affiliation
          </button>
          <button 
            onClick={() => navigate('/entreprises/nouvelle')} 
            className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-blue-300 hover:text-blue-600 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Building2 className="w-5 h-5 mr-2" />
            Créer une entreprise
          </button>
        </div>
      </div>

      {/* Section 1: Vue d'ensemble - Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6 text-blue-600" />}
          title="Travailleurs"
          value={overview?.travailleurs ?? '-'}
          color="text-blue-600"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          change="+12% ce mois"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6 text-emerald-600" />}
          title="Visites programmées"
          value={overview?.visitesProgrammees ?? '-'}
          color="text-emerald-600"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          icon={<UserCheck className="w-6 h-6 text-green-600" />}
          title="Aptitudes"
          value={overview?.aptitudes ?? '-'}
          color="text-green-600"
          gradient="bg-gradient-to-br from-green-500 to-green-600"
          change="+5% ce mois"
        />
        <StatCard
          icon={<UserX className="w-6 h-6 text-red-600" />}
          title="Inaptitudes"
          value={overview?.inaptitudes ?? '-'}
          color="text-red-600"
          gradient="bg-gradient-to-br from-red-500 to-red-600"
        />
        <StatCard
          icon={<Clock className="w-6 h-6 text-amber-600" />}
          title="Visites en attente"
          value={overview?.visitesEnAttente ?? '-'}
          color="text-amber-600"
          gradient="bg-gradient-to-br from-amber-500 to-amber-600"
        />
        <StatCard
          icon={<RefreshCw className="w-6 h-6 text-purple-600" />}
          title="À renouveler"
          value={overview?.visitesARenouveler ?? '-'}
          color="text-purple-600"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
        />
      </div>

      {/* Section 2: Mes Travailleurs */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mes Travailleurs</h2>
              <p className="text-gray-600 mt-1">Gérez votre équipe et suivez leur état médical</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Chip label="Tous" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
              <Chip label="Aptes" active={filter === 'APTE'} onClick={() => setFilter('APTE')} />
              <Chip label="Inaptes" active={filter === 'INAPTE'} onClick={() => setFilter('INAPTE')} />
              <Chip label="À renouveler" active={filter === 'A_RENOUVELER'} onClick={() => setFilter('A_RENOUVELER')} />
            </div>
          </div>
        </div>
        
        {/* Barre de recherche */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un travailleur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Nom</th>
                <th className="text-left p-4 font-semibold text-gray-700">Prénom</th>
                <th className="text-left p-4 font-semibold text-gray-700">Poste</th>
                <th className="text-left p-4 font-semibold text-gray-700">Dernière visite</th>
                <th className="text-left p-4 font-semibold text-gray-700">Aptitude</th>
                <th className="p-4 font-semibold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(Array.isArray(filtered) ? filtered.slice(0, 10) : []).map((w: any, index: number) => (
                <tr key={w.id} className={`hover:bg-blue-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{w.nom}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-700">{w.prenom}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-600">{w.poste || '-'}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-600">
                      {w.derniereVisite ? String(w.derniereVisite).slice(0, 10) : '-'}
                    </div>
                  </td>
                  <td className="p-4">
                    {w.aptitude === 'APTE' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        Apte
                      </span>
                    )}
                    {w.aptitude === 'INAPTE' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                        Inapte
                      </span>
                    )}
                    {!w.aptitude && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                        À renouveler
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200" 
                        title="Voir détail" 
                        onClick={() => navigate(`/travailleurs/${w.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all duration-200" 
                        title="Modifier" 
                        onClick={() => navigate(`/travailleurs/${w.id}/edit`)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-100 rounded-lg transition-all duration-200" 
                        title="Programmer visite" 
                        onClick={() => navigate(`/visites-medicales/nouvelle?travailleurId=${w.id}`)}
                      >
                        <CalendarIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {filtered?.length || 0} travailleur(s) affiché(s)
            </div>
            <button 
              onClick={() => navigate('/travailleurs')} 
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors duration-200"
            >
              Voir tous mes travailleurs →
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Demandes de visites (rapide) */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Nouvelle demande de visite</h2>
          <p className="text-gray-600 mt-1">Planifiez rapidement vos visites médicales</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de visite</label>
              <select 
                id="req-type" 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="EMBAUCHE">Embauche</option>
                <option value="PERIODIQUE">Périodique</option>
                <option value="FIN_CONTRAT">Fin de contrat</option>
                <option value="REPRISE">Reprise</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Travailleurs concernés</label>
              <select 
                id="req-workers" 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white" 
                multiple 
                size={4}
              >
                {(workers || []).map((w: any) => (
                  <option key={w.id} value={w.id} className="py-1">{w.nom} {w.prenom}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date souhaitée</label>
              <input 
                id="req-date" 
                type="date" 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white" 
              />
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Commentaires</label>
              <input 
                id="req-comment" 
                type="text" 
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white" 
                placeholder="Observation courte..." 
              />
            </div>
            
            <div className="md:col-span-1">
              <button
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
                onClick={async () => {
                  const type = (document.getElementById('req-type') as HTMLSelectElement).value;
                  const date = (document.getElementById('req-date') as HTMLInputElement).value;
                  const select = (document.getElementById('req-workers') as HTMLSelectElement);
                  const ids = Array.from(select.selectedOptions).map(o => Number(o.value));
                  const observations = (document.getElementById('req-comment') as HTMLInputElement).value;
                  if (!ids.length || !date) {
                    alert('Sélectionnez au moins un travailleur et une date');
                    return;
                  }
                  try {
                    for (const id of ids) {
                      await visiteMedicaleAPI.create({
                        type,
                        date: `${date}T00:00:00`,
                        observations,
                        examens: [],
                        statut: 'EN_ATTENTE',
                        travailleur: { id } as any
                      });
                    }
                    alert('Demande envoyée avec succès');
                  } catch (error) {
                    alert('Erreur lors de l\'envoi de la demande');
                  }
                }}
              >
                <CalendarIcon className="w-5 h-5 mr-2" />
                Envoyer demande
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Mes Demandes d'Affiliation */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mes Demandes d'Affiliation</h2>
              <p className="text-gray-600 mt-1">Suivez le statut de vos demandes d'affiliation</p>
            </div>
            <button
              onClick={() => navigate('/mes-demandes-affiliation')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Voir toutes →
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {demandesAffiliation && demandesAffiliation.length > 0 ? (
            <div className="space-y-4">
              {demandesAffiliation.slice(0, 3).map((demande: any, index: number) => {
                const getStatusInfo = (statut: string) => {
                  switch (statut) {
                    case 'NOUVELLE':
                      return { color: 'bg-blue-100 text-blue-800', label: 'En attente', icon: Clock };
                    case 'EN_COURS':
                      return { color: 'bg-yellow-100 text-yellow-800', label: 'En cours', icon: Clock };
                    case 'VALIDEE':
                      return { color: 'bg-green-100 text-green-800', label: 'Validée', icon: UserCheck };
                    case 'REJETEE':
                      return { color: 'bg-red-100 text-red-800', label: 'Rejetée', icon: UserX };
                    default:
                      return { color: 'bg-gray-100 text-gray-800', label: statut, icon: Clock };
                  }
                };
                
                const statusInfo = getStatusInfo(demande.statut);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div 
                    key={demande.id} 
                    className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                      index === 0 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' :
                      index === 1 ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' :
                      'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{demande.raisonSociale}</h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{demande.secteurActivite} • {demande.effectif} employés</p>
                          <p className="text-xs text-gray-500">
                            Soumise le {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        {demande.statut === 'REJETEE' && demande.motifRejet && (
                          <p className="text-xs text-red-600 mt-1">
                            <strong>Motif:</strong> {demande.motifRejet}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-400' :
                          index === 1 ? 'bg-emerald-400' :
                          'bg-purple-400'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <div className="text-gray-500 text-sm">Aucune demande d'affiliation pour le moment.</div>
              <div className="text-gray-400 text-xs mt-1">Soumettez votre première demande d'affiliation</div>
            </div>
          )}
        </div>
      </div>

      {/* Section 5: Prochaines Visites Confirmées */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900">Prochaines Visites Confirmées</h2>
          <p className="text-gray-600 mt-1">Suivez vos rendez-vous médicaux programmés</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-4">
            {Array.isArray(upcoming) && upcoming.length > 0 ? (
              upcoming.slice(0, 3).map((v: any, index: number) => (
                <div 
                  key={v.id} 
                  className={`p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                    index === 0 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' :
                    index === 1 ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' :
                    'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      index === 0 ? 'bg-blue-100 text-blue-600' :
                      index === 1 ? 'bg-emerald-100 text-emerald-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-900">
                          {String(v.dateVisite).slice(0, 10)}
                        </span>
                        <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700 border">
                          {v.type}
                        </span>
                      </div>
                      <div className="text-gray-600 mt-1">
                        Médecin: {v.medecin?.nom || 'Dr.'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-blue-400' :
                        index === 1 ? 'bg-emerald-400' :
                        'bg-purple-400'
                      }`}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-500 text-sm">Aucune visite planifiée pour le moment.</div>
                <div className="text-gray-400 text-xs mt-1">Utilisez le formulaire ci-dessus pour planifier vos visites</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Contrats Générés */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Mes Contrats d'Affiliation</h2>
            <p className="text-gray-600 mt-1">Consultez et téléchargez vos contrats générés</p>
          </div>

          <div className="p-6">
            {contratsGeneres.length > 0 ? (
              <div className="space-y-4">
                {contratsGeneres.map((contrat: any, index: number) => (
                <div 
                  key={index}
                  className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{contrat.numeroContrat}</h3>
                        <p className="text-sm text-gray-600">{contrat.raisonSociale}</p>
                        <p className="text-xs text-gray-500">
                          Zone: {contrat.zone} • Montant: {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                            minimumFractionDigits: 0
                          }).format(contrat.montant)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Généré le: {new Date(contrat.dateGeneration).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => viewContrat(contrat)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="h-4 w-4 mr-2 inline" />
                        Consulter
                      </button>
          <button
                        onClick={() => downloadContrat(contrat)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
                        <Download className="h-4 w-4 mr-2 inline" />
                        Télécharger
          </button>
        </div>
                  </div>
          </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="text-gray-500 text-sm">Aucun contrat généré pour le moment.</div>
                <div className="text-gray-400 text-xs mt-1">
                  Créez un contrat depuis vos demandes d'affiliation validées
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default DashboardEmployeur