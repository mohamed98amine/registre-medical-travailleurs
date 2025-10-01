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
import { MedicalStatCard, PatientCard, VisitCard, QuickSummaryCard } from '../components/MedicalCards';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 p-6 space-y-8 animate-fade-in-medical">
      {/* Header moderne avec titre et actions principales */}
      <div className="medical-card">
        <div className="medical-card-body">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 gradient-medical-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
        <div>
                  <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord Employeur
          </h1>
                  <p className="text-gray-600 mt-1">Gérez vos travailleurs et suivez leur santé au travail</p>
                </div>
              </div>
              
              {/* Indicateurs rapides */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">Système actif</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-600">Dernière sync: Il y a 5 min</span>
                </div>
              </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => navigate('/travailleurs/nouveau')} 
                className="btn-medical btn-medical-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
                Ajouter Travailleur
          </button>
          <button 
            onClick={() => navigate('/demandes-visite/nouvelle')} 
                className="btn-medical btn-medical-success"
          >
            <Calendar className="w-5 h-5 mr-2" />
                Nouvelle Visite
          </button>
          <button 
            onClick={() => navigate('/demande-affiliation')} 
                className="btn-medical btn-medical-ghost"
          >
            <FileText className="w-5 h-5 mr-2" />
                Affiliation
          </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Vue d'ensemble - Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <MedicalStatCard
          icon={<Users className="w-6 h-6" />}
          title="Travailleurs"
          value={overview?.travailleurs ?? '-'}
          color="blue"
          change={{
            value: "+12% ce mois",
            type: "positive"
          }}
          subtitle="Employés actifs"
        />
        <MedicalStatCard
          icon={<Calendar className="w-6 h-6" />}
          title="Visites Programmées"
          value={overview?.visitesProgrammees ?? '-'}
          color="green"
          subtitle="Rendez-vous planifiés"
        />
        <MedicalStatCard
          icon={<UserCheck className="w-6 h-6" />}
          title="Aptes au Travail"
          value={overview?.aptitudes ?? '-'}
          color="green"
          change={{
            value: "+5% ce mois",
            type: "positive"
          }}
          subtitle="Certificats valides"
        />
        <MedicalStatCard
          icon={<UserX className="w-6 h-6" />}
          title="Inaptitudes"
          value={overview?.inaptitudes ?? '-'}
          color="red"
          subtitle="Restrictions médicales"
        />
        <MedicalStatCard
          icon={<Clock className="w-6 h-6" />}
          title="En Attente"
          value={overview?.visitesEnAttente ?? '-'}
          color="orange"
          subtitle="Visites à programmer"
        />
        <MedicalStatCard
          icon={<RefreshCw className="w-6 h-6" />}
          title="À Renouveler"
          value={overview?.visitesARenouveler ?? '-'}
          color="purple"
          subtitle="Certificats expirés"
        />
      </div>

      {/* Section 2: Mes Travailleurs */}
      <div className="medical-card">
        <div className="medical-card-header">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 gradient-medical-success rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mes Travailleurs</h2>
              <p className="text-gray-600 mt-1">Gérez votre équipe et suivez leur état médical</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Chip label="Tous" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
              <Chip label="Aptes" active={filter === 'APTE'} onClick={() => setFilter('APTE')} />
              <Chip label="Inaptes" active={filter === 'INAPTE'} onClick={() => setFilter('INAPTE')} />
              <Chip label="À renouveler" active={filter === 'A_RENOUVELER'} onClick={() => setFilter('A_RENOUVELER')} />
            </div>
          </div>
        </div>
        
        {/* Barre de recherche moderne */}
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un travailleur (nom, prénom, poste)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input-medical pl-10 pr-4 py-3 w-full"
            />
          </div>
        </div>

        <div className="medical-card-body">
          {/* Affichage en grille pour les travailleurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(Array.isArray(filtered) ? filtered.slice(0, 9) : []).map((w: any) => (
              <PatientCard
                key={w.id}
                patient={{
                  id: w.id,
                  nom: w.nom,
                  prenom: w.prenom,
                  poste: w.poste,
                  derniereVisite: w.derniereVisite,
                  statut: w.aptitude || 'RENOUVELER',
                  entreprise: "Mon Entreprise"
                }}
                onView={(id) => navigate(`/travailleurs/${id}`)}
                onEdit={(id) => navigate(`/visites-medicales/nouvelle?travailleurId=${id}`)}
                compact={false}
              />
            ))}
          </div>
          
          {/* Affichage vide */}
          {(!filtered || filtered.length === 0) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 gradient-medical-primary rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                <Users className="h-8 w-8 text-white" />
                    </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun travailleur trouvé</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Aucun résultat pour votre recherche.' : 'Commencez par ajouter des travailleurs.'}
              </p>
                      <button 
                onClick={() => navigate('/travailleurs/nouveau')}
                className="btn-medical btn-medical-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un travailleur
                      </button>
                    </div>
          )}
        </div>
        
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{filtered?.length || 0} travailleur(s) affiché(s)</span>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <span>Dernière mise à jour: maintenant</span>
            </div>
            <button 
              onClick={() => navigate('/travailleurs')} 
              className="btn-medical btn-medical-ghost"
            >
              Voir tous mes travailleurs
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Planification Rapide */}
      <div className="medical-card">
        <div className="medical-card-header">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Planification Rapide</h2>
              <p className="text-gray-600 mt-1">Programmez vos visites médicales en quelques clics</p>
            </div>
          </div>
        </div>
        
        <div className="medical-card-body">
          <div className="form-medical">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="form-group-medical">
                <label className="form-label-medical">Type de visite</label>
              <select 
                id="req-type" 
                  className="form-select-medical"
                >
                  <option value="EMBAUCHE">Visite d'Embauche</option>
                  <option value="PERIODIQUE">Visite Périodique</option>
                  <option value="FIN_CONTRAT">Fin de Contrat</option>
                  <option value="REPRISE">Visite de Reprise</option>
              </select>
            </div>
            
              <div className="md:col-span-2 form-group-medical">
                <label className="form-label-medical">Travailleurs concernés</label>
              <select 
                id="req-workers" 
                  className="form-select-medical" 
                multiple 
                size={4}
              >
                {(workers || []).map((w: any) => (
                    <option key={w.id} value={w.id} className="py-2">{w.nom} {w.prenom} - {w.poste}</option>
                ))}
              </select>
            </div>
            
              <div className="form-group-medical">
                <label className="form-label-medical">Date souhaitée</label>
              <input 
                id="req-date" 
                type="date" 
                  className="form-input-medical" 
                  min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
              <div className="md:col-span-3 form-group-medical">
                <label className="form-label-medical">Commentaires & Observations</label>
              <input 
                id="req-comment" 
                type="text" 
                  className="form-input-medical" 
                  placeholder="Urgence, contraintes particulières..." 
              />
            </div>
            
              <div className="md:col-span-1 flex items-end">
              <button
                  className="btn-medical btn-medical-success w-full"
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
                  Planifier
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Vue d'ensemble des demandes et visites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Mes Demandes d'Affiliation */}
        <div className="medical-card">
          <div className="medical-card-header">
          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
            <div>
                  <h2 className="text-xl font-bold text-gray-900">Demandes d'Affiliation</h2>
                  <p className="text-gray-600 text-sm">Statut de vos demandes</p>
                </div>
            </div>
            <button
              onClick={() => navigate('/mes-demandes-affiliation')}
                className="btn-medical btn-medical-ghost text-sm"
            >
                Voir toutes
            </button>
          </div>
        </div>
        
          <div className="medical-card-body">
            {demandesAffiliation && demandesAffiliation.length > 0 ? (
              <div className="space-y-4">
                {demandesAffiliation.slice(0, 3).map((demande: any, index: number) => {
                  const getStatusInfo = (statut: string) => {
                    switch (statut) {
                      case 'NOUVELLE':
                        return { color: 'badge-medical-info', label: 'En attente', icon: Clock };
                      case 'EN_COURS':
                        return { color: 'badge-medical-warning', label: 'En cours', icon: Clock };
                      case 'VALIDEE':
                        return { color: 'badge-medical-success', label: 'Validée', icon: UserCheck };
                      case 'REJETEE':
                        return { color: 'badge-medical-danger', label: 'Rejetée', icon: UserX };
                      default:
                        return { color: 'badge-medical-info', label: statut, icon: Clock };
                    }
                  };
                  
                  const statusInfo = getStatusInfo(demande.statut);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div 
                      key={demande.id} 
                      className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-purple-50/50 to-indigo-50/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{demande.raisonSociale}</h4>
                            <span className={`badge-medical ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{demande.secteurActivite} • {demande.effectif} employés</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Soumise le {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                          {demande.statut === 'REJETEE' && demande.motifRejet && (
                            <p className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded-lg">
                              <strong>Motif de rejet:</strong> {demande.motifRejet}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 gradient-medical-primary rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-50">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune demande d'affiliation</h3>
                <p className="text-gray-600 mb-4">Commencez par soumettre votre première demande</p>
                <button
                  onClick={() => navigate('/demande-affiliation')}
                  className="btn-medical btn-medical-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle demande
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Prochaines Visites */}
        <div className="medical-card">
          <div className="medical-card-header">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <CalendarIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Prochaines Visites</h2>
                  <p className="text-gray-600 text-sm">Rendez-vous confirmés</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/visites-medicales')}
                className="btn-medical btn-medical-ghost text-sm"
              >
                Voir toutes
              </button>
            </div>
          </div>
          
          <div className="medical-card-body">
            {Array.isArray(upcoming) && upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.slice(0, 3).map((v: any, index: number) => (
                  <div 
                    key={v.id} 
                    className="p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-green-50/50 to-emerald-50/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="font-semibold text-gray-900">
                            {String(v.dateVisite).slice(0, 10)}
                          </span>
                          <span className="badge-medical badge-medical-info">
                            {v.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Médecin: {v.medecin?.nom || 'Dr. Non assigné'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune visite planifiée</h3>
                <p className="text-gray-600 mb-4">Utilisez le formulaire de planification ci-dessus</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section Contrats */}
      <QuickSummaryCard
        title="Contrats d'Affiliation"
        icon={<FileText className="h-5 w-5" />}
        color="purple"
        items={[
          { label: "Contrats générés", value: contratsGeneres.length },
          { label: "En cours", value: "2" },
          { label: "Validés", value: contratsGeneres.length - 2 }
        ]}
      />
    </div>
  );
};

export default DashboardEmployeur