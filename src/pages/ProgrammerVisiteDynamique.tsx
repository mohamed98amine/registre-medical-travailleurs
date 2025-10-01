import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  disponible: boolean;
}

interface Entreprise {
  id: number;
  nom: string;
  secteurActivite: string;
  effectif: number;
}

interface Employeur {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  statut: string;
}

const ProgrammerVisiteDynamique: React.FC = () => {
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [employeurs, setEmployeurs] = useState<Employeur[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployeurs, setLoadingEmployeurs] = useState(false);

  // Formulaire visite
  const [formData, setFormData] = useState({
    entrepriseId: '',
    employeurId: '',
    medecinId: '',
    typeVisite: '',
    dateVisite: '',
    heureVisite: '',
    commentaires: ''
  });

  // Formulaires d'ajout rapide
  const [showAddMedecin, setShowAddMedecin] = useState(false);
  const [showAddEntreprise, setShowAddEntreprise] = useState(false);
  const [showAddEmployeur, setShowAddEmployeur] = useState(false);

  const [newMedecin, setNewMedecin] = useState({
    nom: '', prenom: '', email: '', telephone: '', specialite: ''
  });

  const [newEntreprise, setNewEntreprise] = useState({
    nom: '', adresse: '', email: '', telephone: '', secteurActivite: '', effectif: ''
  });

  const [newEmployeur, setNewEmployeur] = useState({
    nom: '', email: '', telephone: '', statut: 'Actif'
  });

  const typesVisite = [
    { value: 'VMA', label: 'Visite Médicale d\'Aptitude' },
    { value: 'VLT', label: 'Visite de Levée de Travail' },
    { value: 'VRE', label: 'Visite de Reprise d\'Emploi' },
    { value: 'VPC', label: 'Visite Périodique de Contrôle' }
  ];

  useEffect(() => {
    loadAllData();
  }, []);
  
  // Écouter les mises à jour de visites et employeurs
  useEffect(() => {
    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'visitesUpdated' || e.key === 'employeursUpdated') {
        console.log('Détection mise à jour - rechargement données');
        loadAllData();
      }
    };
    
    window.addEventListener('storage', handleStorageUpdate);
    return () => window.removeEventListener('storage', handleStorageUpdate);
  }, []);

  const loadAllData = async () => {
    await Promise.all([loadMedecins(), loadEntreprises(), loadEmployeurs()]);
  };

  const loadMedecins = async () => {
    try {
      const response = await fetch('/api/medecins');
      if (response.ok) {
        const data = await response.json();
        setMedecins(data);
      }
    } catch (error) {
      console.error('Erreur chargement médecins:', error);
    }
  };

  const loadEntreprises = async () => {
    try {
      const response = await fetch('/api/entreprises');
      if (response.ok) {
        const data = await response.json();
        setEntreprises(data);
      }
    } catch (error) {
      console.error('Erreur chargement entreprises:', error);
    }
  };

  const loadEmployeurs = async () => {
    try {
      setLoadingEmployeurs(true);
      const response = await fetch('/api/employeurs');
      if (response.ok) {
        const data = await response.json();
        setEmployeurs(data);
        console.log('Employeurs rechargés:', data.length);
      } else {
        toast.error('Erreur lors du chargement des employeurs');
      }
    } catch (error) {
      console.error('Erreur chargement employeurs:', error);
      toast.error('Erreur lors du chargement des employeurs');
    } finally {
      setLoadingEmployeurs(false);
    }
  };

  const addMedecin = async () => {
    try {
      const response = await fetch('/api/medecins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMedecin)
      });
      
      if (response.ok) {
        const created = await response.json();
        
        // Recharger la liste complète des médecins depuis le serveur
        await loadMedecins();
        
        // Sélectionner automatiquement le nouveau médecin
        setFormData(prev => ({
          ...prev,
          medecinId: created.id.toString()
        }));
        
        setNewMedecin({ nom: '', prenom: '', email: '', telephone: '', specialite: '' });
        setShowAddMedecin(false);
        toast.success(`Médecin "Dr. ${created.nom} ${created.prenom}" ajouté et sélectionné avec succès!`);
      } else {
        const errorData = await response.json();
        toast.error(`Erreur: ${errorData.error || 'Erreur lors de l\'ajout du médecin'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du médecin:', error);
      toast.error('Erreur lors de l\'ajout du médecin');
    }
  };

  const addEntreprise = async () => {
    try {
      const response = await fetch('/api/entreprises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEntreprise,
          effectif: parseInt(newEntreprise.effectif) || 0
        })
      });
      
      if (response.ok) {
        const created = await response.json();
        
        // Recharger la liste complète des entreprises depuis le serveur
        await loadEntreprises();
        
        // Sélectionner automatiquement la nouvelle entreprise
        setFormData(prev => ({
          ...prev,
          entrepriseId: created.id.toString()
        }));
        
        setNewEntreprise({ nom: '', adresse: '', email: '', telephone: '', secteurActivite: '', effectif: '' });
        setShowAddEntreprise(false);
        toast.success(`Entreprise "${created.nom}" ajoutée et sélectionnée avec succès!`);
      } else {
        const errorData = await response.json();
        toast.error(`Erreur: ${errorData.error || 'Erreur lors de l\'ajout de l\'entreprise'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'entreprise:', error);
      toast.error('Erreur lors de l\'ajout de l\'entreprise');
    }
  };

  const addEmployeur = async () => {
    try {
      const response = await fetch('/api/employeurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployeur)
      });
      
      if (response.ok) {
        const created = await response.json();
        
        // Recharger la liste complète des employeurs depuis le serveur
        await loadEmployeurs();
        
        // Sélectionner automatiquement le nouvel employeur
        setFormData(prev => ({
          ...prev,
          employeurId: created.id.toString()
        }));
        
        setNewEmployeur({ nom: '', email: '', telephone: '', statut: 'Actif' });
        setShowAddEmployeur(false);
        toast.success(`Employeur "${created.nom}" ajouté et sélectionné avec succès!`);
      } else {
        const errorData = await response.json();
        toast.error(`Erreur: ${errorData.error || 'Erreur lors de l\'ajout de l\'employeur'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employeur:', error);
      toast.error('Erreur lors de l\'ajout de l\'employeur');
    }
  };

  const createVisite = async () => {
    if (!formData.entrepriseId || !formData.employeurId || !formData.medecinId || 
        !formData.typeVisite || !formData.dateVisite || !formData.heureVisite) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      
      const requestData = {
        entrepriseId: parseInt(formData.entrepriseId),
        employeurId: parseInt(formData.employeurId),
        medecinId: parseInt(formData.medecinId),
        typeVisite: formData.typeVisite,
        dateVisite: formData.dateVisite,
        heureVisite: formData.heureVisite,
        commentaires: formData.commentaires,
        statut: 'Prévue'
      };
      
      console.log('Envoi des données:', requestData);
      
      const response = await fetch('/api/visites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });
      
      const result = await response.json();
      console.log('Réponse serveur:', result);
      
      if (response.ok) {
        // Le backend retourne maintenant la visite complète avec employeur et médecin
        const visiteComplete = result;
        
        // Trouver les noms pour le message de succès
        const typeVisiteLabel = typesVisite.find(t => t.value === formData.typeVisite)?.label || formData.typeVisite;
        const employeurNom = visiteComplete.employeur?.nom || 'Employeur inconnu';
        const medecinNom = visiteComplete.medecin?.nom || 'Médecin inconnu';
        
        toast.success(`Visite programmée : ${typeVisiteLabel} pour ${employeurNom} avec Dr. ${medecinNom}`);
        
        // Réinitialiser le formulaire
        setFormData({
          entrepriseId: '', employeurId: '', medecinId: '',
          typeVisite: '', dateVisite: '', heureVisite: '', commentaires: ''
        });
        
        // Déclencher rechargement de la liste des visites
        console.log('Visite créée, déclenchement rechargement');
        
        // Utiliser localStorage pour notifier les autres onglets
        localStorage.setItem('visitesUpdated', Date.now().toString());
        
        // Déclencher événement personnalisé pour le même onglet
        window.dispatchEvent(new CustomEvent('visiteCreated', { detail: { id: result.id } }));
        
        // Vérifier que la visite apparaît dans la liste
        setTimeout(async () => {
          try {
            const checkResponse = await fetch(`/api/visites?_t=${Date.now()}`);
            if (checkResponse.ok) {
              const visites = await checkResponse.json();
              const nouvelleVisite = visites.find((v: any) => v.id === result.id);
              if (!nouvelleVisite) {
                console.error('ERREUR: Visite créée mais non trouvée dans la liste!');
                toast.error('Visite créée mais non visible dans la liste - Vérifiez l\'onglet Visites');
              } else {
                console.log('Confirmation: Visite trouvée dans la liste:', nouvelleVisite);
                toast.success('Visite visible dans l\'onglet Visites Médicales!');
              }
            }
          } catch (error) {
            console.error('Erreur lors de la vérification:', error);
          }
        }, 1000);
        
      } else {
        console.error('Erreur serveur:', result);
        toast.error(`Erreur: ${result.error || 'Erreur lors de la création'}`);
      }
    } catch (error) {
      console.error('Erreur réseau:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold">Programmer une Visite</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sélection Entreprise */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Entreprise *</label>
                <button
                  onClick={() => setShowAddEntreprise(!showAddEntreprise)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {showAddEntreprise && (
                <div className="mb-3 p-3 border rounded bg-gray-50">
                  <input
                    placeholder="Nom entreprise"
                    value={newEntreprise.nom}
                    onChange={(e) => setNewEntreprise({...newEntreprise, nom: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Adresse"
                    value={newEntreprise.adresse}
                    onChange={(e) => setNewEntreprise({...newEntreprise, adresse: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Email"
                    value={newEntreprise.email}
                    onChange={(e) => setNewEntreprise({...newEntreprise, email: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Téléphone"
                    value={newEntreprise.telephone}
                    onChange={(e) => setNewEntreprise({...newEntreprise, telephone: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Secteur"
                    value={newEntreprise.secteurActivite}
                    onChange={(e) => setNewEntreprise({...newEntreprise, secteurActivite: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Effectif"
                    type="number"
                    value={newEntreprise.effectif}
                    onChange={(e) => setNewEntreprise({...newEntreprise, effectif: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={addEntreprise}
                    className="w-full bg-blue-600 text-white py-1 rounded text-sm"
                  >
                    Ajouter
                  </button>
                </div>
              )}
              
              <select
                value={formData.entrepriseId}
                onChange={(e) => setFormData({...formData, entrepriseId: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Sélectionner une entreprise</option>
                {entreprises.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nom} - {e.secteurActivite}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection Employeur */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Employeur *</label>
                <div className="flex gap-2">
                  <button
                    onClick={loadEmployeurs}
                    disabled={loadingEmployeurs}
                    className={`${loadingEmployeurs ? 'text-gray-400' : 'text-green-600 hover:text-green-800'} transition-colors`}
                    title="Recharger la liste des employeurs"
                  >
                    {loadingEmployeurs ? (
                      <svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => setShowAddEmployeur(!showAddEmployeur)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Ajouter un employeur"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {showAddEmployeur && (
                <div className="mb-3 p-3 border rounded bg-gray-50">
                  <input
                    placeholder="Nom *"
                    value={newEmployeur.nom}
                    onChange={(e) => setNewEmployeur({...newEmployeur, nom: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Email"
                    value={newEmployeur.email}
                    onChange={(e) => setNewEmployeur({...newEmployeur, email: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Téléphone"
                    value={newEmployeur.telephone}
                    onChange={(e) => setNewEmployeur({...newEmployeur, telephone: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <select
                    value={newEmployeur.statut}
                    onChange={(e) => setNewEmployeur({...newEmployeur, statut: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                  <button
                    onClick={addEmployeur}
                    className="w-full bg-blue-600 text-white py-1 rounded text-sm"
                  >
                    Ajouter
                  </button>
                </div>
              )}
              
              <select
                value={formData.employeurId}
                onChange={(e) => setFormData({...formData, employeurId: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Sélectionner un employeur</option>
                {employeurs.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection Médecin */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Médecin *</label>
                <button
                  onClick={() => setShowAddMedecin(!showAddMedecin)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {showAddMedecin && (
                <div className="mb-3 p-3 border rounded bg-gray-50">
                  <input
                    placeholder="Nom"
                    value={newMedecin.nom}
                    onChange={(e) => setNewMedecin({...newMedecin, nom: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Prénom"
                    value={newMedecin.prenom}
                    onChange={(e) => setNewMedecin({...newMedecin, prenom: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Email"
                    value={newMedecin.email}
                    onChange={(e) => setNewMedecin({...newMedecin, email: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Téléphone"
                    value={newMedecin.telephone}
                    onChange={(e) => setNewMedecin({...newMedecin, telephone: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <input
                    placeholder="Spécialité"
                    value={newMedecin.specialite}
                    onChange={(e) => setNewMedecin({...newMedecin, specialite: e.target.value})}
                    className="w-full mb-2 px-2 py-1 border rounded text-sm"
                  />
                  <button
                    onClick={addMedecin}
                    className="w-full bg-blue-600 text-white py-1 rounded text-sm"
                  >
                    Ajouter
                  </button>
                </div>
              )}
              
              <select
                value={formData.medecinId}
                onChange={(e) => setFormData({...formData, medecinId: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Sélectionner un médecin</option>
                {medecins.map(m => (
                  <option key={m.id} value={m.id}>
                    Dr. {m.prenom} {m.nom} - {m.specialite}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Détails de la visite */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de visite *</label>
              <select
                value={formData.typeVisite}
                onChange={(e) => setFormData({...formData, typeVisite: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Sélectionner le type</option>
                {typesVisite.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={formData.dateVisite}
                onChange={(e) => setFormData({...formData, dateVisite: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure *</label>
              <input
                type="time"
                value={formData.heureVisite}
                onChange={(e) => setFormData({...formData, heureVisite: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Commentaires</label>
            <textarea
              value={formData.commentaires}
              onChange={(e) => setFormData({...formData, commentaires: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={createVisite}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Programmation...' : 'Programmer la Visite'}
            </button>
          </div>

          {/* Statistiques MySQL */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-3">Données MySQL Disponibles</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{entreprises.length}</div>
                <div className="text-sm text-blue-700">Entreprises MySQL</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{employeurs.length}</div>
                <div className="text-sm text-green-700">Employeurs MySQL</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{medecins.length}</div>
                <div className="text-sm text-purple-700">Médecins MySQL</div>
              </div>
            </div>
            <div className="mt-3 text-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ MySQL - Utilise employeur_id (pas travailleur)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgrammerVisiteDynamique;