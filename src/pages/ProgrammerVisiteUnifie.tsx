import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Stethoscope, Building2, Clock, Save, ArrowLeft, Search, User, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  email: string;
  telephone: string;
  disponible: boolean;
}

interface Entreprise {
  id: number;
  nom: string;
  secteurActivite: string;
  effectif: number;
  adresse: string;
  email: string;
  telephone: string;
  statut: string;
  ville: string;
  codePostal: string;
}

interface Employeur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  active: boolean;
  specialite?: string;
}

interface VisiteFormData {
  entrepriseId: string;
  employeurId: string;
  medecinId: string;
  dateVisite: string;
  heureVisite: string;
  typeVisite: string;
  commentaires: string;
}

const ProgrammerVisiteUnifie: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [employeurs, setEmployeurs] = useState<Employeur[]>([]);
  const [formData, setFormData] = useState<VisiteFormData>({
    entrepriseId: '',
    employeurId: '',
    medecinId: '',
    dateVisite: '',
    heureVisite: '',
    typeVisite: '',
    commentaires: ''
  });
  const [errors, setErrors] = useState<Partial<VisiteFormData>>({});
  const [searchMedecin, setSearchMedecin] = useState('');
  const [searchEntreprise, setSearchEntreprise] = useState('');

  const typesVisite = [
    { value: 'VMA', label: 'Visite Médicale d\'Aptitude' },
    { value: 'VLT', label: 'Visite de Levée de Travail' },
    { value: 'VRE', label: 'Visite de Reprise d\'Emploi' },
    { value: 'VPC', label: 'Visite Périodique de Contrôle' }
  ];

  useEffect(() => {
    loadAllData();
    // Définir la date minimale à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ ...prev, dateVisite: today }));
  }, []);

  // Recharger les données quand la page devient visible (retour d'un autre onglet)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadAllData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadAllData = async () => {
    try {
      await Promise.all([loadMedecins(), loadEntreprises(), loadEmployeurs()]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    }
  };

  const loadMedecins = async () => {
    try {
      const response = await fetch('/api/medecins');
      if (response.ok) {
        const data = await response.json();
        setMedecins(data);
        console.log('Médecins chargés:', data.length);
      } else {
        console.warn('Erreur chargement médecins:', response.status);
      }
    } catch (error) {
      console.warn('Erreur chargement médecins:', error);
    }
  };

  const loadEntreprises = async () => {
    try {
      const response = await fetch('/api/entreprises');
      if (response.ok) {
        const data = await response.json();
        setEntreprises(data);
        console.log('Entreprises chargées:', data.length);
      } else {
        console.warn('Erreur chargement entreprises:', response.status);
      }
    } catch (error) {
      console.warn('Erreur chargement entreprises:', error);
    }
  };

  const loadEmployeurs = async () => {
    try {
      const response = await fetch('/api/employeurs');
      if (response.ok) {
        const data = await response.json();
        setEmployeurs(data);
        console.log('Employeurs chargés:', data.length);
      } else {
        console.warn('Erreur chargement employeurs:', response.status);
      }
    } catch (error) {
      console.warn('Erreur chargement employeurs:', error);
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user makes changes
    if (errors[name as keyof VisiteFormData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<VisiteFormData> = {};

    if (!formData.entrepriseId) {
      newErrors.entrepriseId = 'Veuillez sélectionner une entreprise';
    }

    if (!formData.employeurId) {
      newErrors.employeurId = 'Veuillez sélectionner un employeur';
    }

    if (!formData.medecinId) {
      newErrors.medecinId = 'Veuillez sélectionner un médecin';
    }

    if (!formData.dateVisite) {
      newErrors.dateVisite = 'La date de visite est requise';
    } else {
      const selectedDate = new Date(formData.dateVisite);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.dateVisite = 'La date ne peut pas être dans le passé';
      }
    }

    if (!formData.heureVisite) {
      newErrors.heureVisite = 'L\'heure de visite est requise';
    }

    if (!formData.typeVisite) {
      newErrors.typeVisite = 'Le type de visite est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/visites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const created = await response.json();
        
        // Le backend retourne maintenant la visite complète avec employeur et médecin
        const visiteComplete = created;
        
        // Trouver les noms pour le message de succès
        const typeVisiteLabel = typesVisite.find(t => t.value === formData.typeVisite)?.label || formData.typeVisite;
        const employeurNom = visiteComplete.employeur?.nom || 'Employeur inconnu';
        const medecinNom = visiteComplete.medecin?.nom || 'Médecin inconnu';

        toast.success(`Visite programmée : ${typeVisiteLabel} pour ${employeurNom} avec Dr. ${medecinNom}`);
        
        // Déclencher le rechargement automatique des visites
        window.dispatchEvent(new CustomEvent('visiteCreated'));
        localStorage.setItem('visitesUpdated', Date.now().toString());
        
        // Reset form
        setFormData({
          entrepriseId: '',
          employeurId: '',
          medecinId: '',
          dateVisite: new Date().toISOString().split('T')[0],
          heureVisite: '',
          typeVisite: '',
          commentaires: ''
        });
        
        navigate('/visites-medicales');
      } else {
        const errorText = await response.text();
        console.error('Erreur API:', errorText);
        toast.error('Erreur lors de la programmation de la visite');
      }
    } catch (error) {
      console.error('Erreur lors de la programmation de la visite:', error);
      toast.error('Erreur lors de la programmation de la visite');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/visites-medicales');
  };

  // Filtrer les médecins disponibles
  const medecinsDisponibles = medecins.filter(medecin => 
    medecin.disponible && 
    (medecin.nom.toLowerCase().includes(searchMedecin.toLowerCase()) ||
     medecin.prenom.toLowerCase().includes(searchMedecin.toLowerCase()) ||
     medecin.specialite.toLowerCase().includes(searchMedecin.toLowerCase()))
  );

  // Filtrer les entreprises actives
  const entreprisesActives = entreprises.filter(entreprise => 
    entreprise.statut === 'ACTIVE' &&
    entreprise.nom.toLowerCase().includes(searchEntreprise.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Retour</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Programmer une Visite Médicale</h1>
                  <p className="text-gray-600">Planifier une nouvelle visite médicale avec listes dynamiques</p>
                </div>
              </div>
            </div>
            <button
              onClick={loadAllData}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser les données
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{entreprises.length}</div>
              <div className="text-sm text-gray-600">Entreprises</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{employeurs.length}</div>
              <div className="text-sm text-gray-600">Employeurs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{medecins.length}</div>
              <div className="text-sm text-gray-600">Médecins</div>
            </div>
          </div>
        </div>

        {/* Message informatif */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">💡 Pour ajouter de nouveaux éléments :</p>
              <p>• <strong>Entreprises :</strong> Utilisez l'onglet "Gérer Entreprise"</p>
              <p>• <strong>Employeurs :</strong> Utilisez l'onglet "Gérer Employeur"</p>
              <p>• <strong>Médecins :</strong> Utilisez l'onglet "Gérer Médecin"</p>
              <p className="mt-2 text-blue-600">Les listes se mettent à jour automatiquement après création.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sélection de l'entreprise */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Entreprise</h2>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une entreprise..."
                  value={searchEntreprise}
                  onChange={(e) => setSearchEntreprise(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="entrepriseId" className="block text-sm font-medium text-gray-700 mb-2">
                  Entreprise *
                </label>
                <select
                  id="entrepriseId"
                  name="entrepriseId"
                  value={formData.entrepriseId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.entrepriseId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionnez une entreprise</option>
                  {entreprisesActives.map((entreprise) => (
                    <option key={entreprise.id} value={entreprise.id}>
                      {entreprise.nom} - {entreprise.secteurActivite}
                    </option>
                  ))}
                </select>
                {errors.entrepriseId && (
                  <p className="mt-1 text-sm text-red-600">{errors.entrepriseId}</p>
                )}
              </div>
            </div>

            {/* Sélection de l'employeur */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Employeur</h2>
              </div>

              <div>
                <label htmlFor="employeurId" className="block text-sm font-medium text-gray-700 mb-2">
                  Employeur *
                </label>
                <select
                  id="employeurId"
                  name="employeurId"
                  value={formData.employeurId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.employeurId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionnez un employeur</option>
                  {employeurs
                    .filter(employeur => employeur.active)
                    .map((employeur) => (
                      <option key={employeur.id} value={employeur.id}>
                        {employeur.nom} {employeur.prenom || ''} - {employeur.email}
                      </option>
                    ))}
                </select>
                {errors.employeurId && (
                  <p className="mt-1 text-sm text-red-600">{errors.employeurId}</p>
                )}
              </div>
            </div>

            {/* Sélection du médecin */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Stethoscope className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Médecin</h2>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un médecin..."
                  value={searchMedecin}
                  onChange={(e) => setSearchMedecin(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="medecinId" className="block text-sm font-medium text-gray-700 mb-2">
                  Médecin *
                </label>
                <select
                  id="medecinId"
                  name="medecinId"
                  value={formData.medecinId}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.medecinId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionnez un médecin</option>
                  {medecinsDisponibles.map((medecin) => (
                    <option key={medecin.id} value={medecin.id}>
                      Dr. {medecin.prenom} {medecin.nom} - {medecin.specialite}
                    </option>
                  ))}
                </select>
                {errors.medecinId && (
                  <p className="mt-1 text-sm text-red-600">{errors.medecinId}</p>
                )}
              </div>
            </div>

            {/* Détails de la visite */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Détails de la Visite</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="typeVisite" className="block text-sm font-medium text-gray-700 mb-2">
                    Type de visite *
                  </label>
                  <select
                    id="typeVisite"
                    name="typeVisite"
                    value={formData.typeVisite}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.typeVisite ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionnez le type de visite</option>
                    {typesVisite.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.typeVisite && (
                    <p className="mt-1 text-sm text-red-600">{errors.typeVisite}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dateVisite" className="block text-sm font-medium text-gray-700 mb-2">
                    Date de visite *
                  </label>
                  <input
                    type="date"
                    id="dateVisite"
                    name="dateVisite"
                    value={formData.dateVisite}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.dateVisite ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateVisite && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateVisite}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="heureVisite" className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de visite *
                </label>
                <input
                  type="time"
                  id="heureVisite"
                  name="heureVisite"
                  value={formData.heureVisite}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.heureVisite ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {errors.heureVisite && (
                  <p className="mt-1 text-sm text-red-600">{errors.heureVisite}</p>
                )}
              </div>

              <div>
                <label htmlFor="commentaires" className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaires (optionnel)
                </label>
                <textarea
                  id="commentaires"
                  name="commentaires"
                  value={formData.commentaires}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ajoutez des commentaires sur cette visite..."
                />
              </div>
            </div>

            {/* Résumé de la visite */}
            {formData.entrepriseId && formData.employeurId && formData.medecinId && formData.dateVisite && formData.heureVisite && formData.typeVisite && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Résumé de la visite :</h3>
                <div className="text-blue-800 space-y-1">
                  <p><strong>Type :</strong> {typesVisite.find(t => t.value === formData.typeVisite)?.label}</p>
                  <p><strong>Entreprise :</strong> {entreprises.find(e => e.id === Number(formData.entrepriseId))?.nom}</p>
                  <p><strong>Employeur :</strong> {(() => {
                    const employeur = employeurs.find(e => e.id === Number(formData.employeurId));
                    return employeur ? `${employeur.nom} ${employeur.prenom || ''}` : 'Employeur inconnu';
                  })()}</p>
                  <p><strong>Médecin :</strong> Dr. {medecins.find(m => m.id === Number(formData.medecinId))?.prenom} {medecins.find(m => m.id === Number(formData.medecinId))?.nom}</p>
                  <p><strong>Date :</strong> {new Date(formData.dateVisite).toLocaleDateString('fr-FR')}</p>
                  <p><strong>Heure :</strong> {formData.heureVisite}</p>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Programmation...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Programmer la Visite</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProgrammerVisiteUnifie;
