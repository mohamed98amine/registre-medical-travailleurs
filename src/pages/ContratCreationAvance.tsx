import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  ArrowLeft,
  Building2, 
  Users, 
  DollarSign,
  FileText,
  CheckCircle,
  Calculator,
  Eye,
  Zap,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { contratAPI, demandeAffiliationAPI } from '../services/api';

interface ContratFormData {
  demandeAffiliationId?: number;
  raisonSociale: string;
  numeroRccm: string;
  adresse: string;
  secteurActivite: string;
  effectif: number;
  contactDrh: string;
  email: string;
  telephone: string;
  typeContrat: 'STANDARD' | 'INDUSTRIE_PETROLIERE' | 'SPECIAL';
  tarifPersonnalise?: number;
  zoneMedicale: string;
  dateDebut: string;
  duree: number;
  commentaires: string;
}

const ContratCreationAvance: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const demandeId = searchParams.get('demande');

  const [formData, setFormData] = useState<ContratFormData>({
    raisonSociale: '',
    numeroRccm: '',
    adresse: '',
    secteurActivite: '',
    effectif: 0,
    contactDrh: '',
    email: '',
    telephone: '',
    typeContrat: 'STANDARD',
    zoneMedicale: '',
    dateDebut: new Date().toISOString().split('T')[0],
    duree: 12,
    commentaires: ''
  });

  const [showPreview, setShowPreview] = useState(false);

  // Récupérer les données de la demande si on vient d'une validation
  const { data: demande } = useQuery({
    queryKey: ['demande-affiliation', demandeId],
    queryFn: async () => {
      if (!demandeId) return null;
      const response = await demandeAffiliationAPI.getById(parseInt(demandeId));
      return response.data;
    },
    enabled: !!demandeId,
    onSuccess: (data) => {
      if (data) {
        // Pré-remplir le formulaire avec les données de la demande
        setFormData(prev => ({
          ...prev,
          demandeAffiliationId: data.id,
          raisonSociale: data.raisonSociale,
          numeroRccm: data.numeroRccm,
          secteurActivite: data.secteurActivite,
          effectif: data.effectif,
          contactDrh: data.contactDrh,
          email: data.email,
          telephone: data.telephone,
          adresse: 'Zone industrielle, Ouagadougou', // Valeur par défaut
          typeContrat: getRecommendedContractType(data.secteurActivite)
        }));
      }
    }
  });

  // Mutation pour créer le contrat
  const createContratMutation = useMutation({
    mutationFn: async (data: ContratFormData) => {
      return await contratAPI.create(data);
    },
    onSuccess: () => {
      toast.success('Contrat créé avec succès !');
      queryClient.invalidateQueries(['contrats']);
      navigate('/contrats');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du contrat');
    }
  });

  // Fonction pour recommander le type de contrat selon le secteur
  const getRecommendedContractType = (secteur: string): 'STANDARD' | 'INDUSTRIE_PETROLIERE' | 'SPECIAL' => {
    const secteurLower = secteur.toLowerCase();
    if (secteurLower.includes('pétrole') || secteurLower.includes('carburant') || secteurLower.includes('distribution')) {
      return 'INDUSTRIE_PETROLIERE';
    }
    return 'STANDARD';
  };

  // Calculs automatiques des tarifs
  const getTarifParEmploye = () => {
    switch (formData.typeContrat) {
      case 'STANDARD': return 15000;
      case 'INDUSTRIE_PETROLIERE': return 45000;
      case 'SPECIAL': return formData.tarifPersonnalise || 0;
      default: return 15000;
    }
  };

  const getTotalAnnuel = () => {
    return formData.effectif * getTarifParEmploye();
  };

  const getTotalTrimestre = () => {
    return getTotalAnnuel() / 4;
  };

  const handleInputChange = (field: keyof ContratFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.raisonSociale || !formData.numeroRccm || formData.effectif <= 0) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    createContratMutation.mutate(formData);
  };

  const generateContractPreview = () => {
    const tarifAnnuel = getTotalAnnuel();
    const tarifMensuel = Math.round(tarifAnnuel / 12);
    
    return `CONTRAT D'AFFILIATION OST N° OST-2025-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}

Entre l'Office de Santé des Travailleurs, représenté par Dr. KONE Amadou, Directeur Régional Centre,

Et l'entreprise ${formData.raisonSociale}, immatriculée sous le numéro ${formData.numeroRccm}, ayant son siège à ${formData.adresse}, représentée par ${formData.contactDrh},

Il est convenu ce qui suit :

Article 1 : L'entreprise ${formData.raisonSociale} emploie ${formData.effectif} travailleurs dans le secteur ${formData.secteurActivite}.

Article 2 : La cotisation annuelle s'élève à ${tarifAnnuel.toLocaleString()} FCFA, soit ${tarifMensuel.toLocaleString()} FCFA par mois.

Article 3 : L'entreprise est rattachée à la zone médicale de ${formData.zoneMedicale || 'Ouagadougou Nord'}.

Article 4 : Le présent contrat prend effet le ${new Date(formData.dateDebut).toLocaleDateString('fr-FR')} pour une durée de ${formData.duree} mois.`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contrats')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour aux contrats
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Génération de Contrat
            </h1>
            <p className="text-gray-600">
              {demandeId ? 'Création automatique depuis une demande validée' : 'Création manuelle d\'un nouveau contrat'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Eye className="h-4 w-4" />
          {showPreview ? 'Masquer' : 'Aperçu'}
        </button>
      </div>

      {/* Alerte de pré-remplissage */}
      {demandeId && demande && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800 font-medium">Formulaire pré-rempli automatiquement</p>
          </div>
          <p className="text-green-700 mt-1">
            Les informations de l'entreprise {demande.raisonSociale} ont été importées depuis la demande d'affiliation validée.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire */}
        <div className="space-y-6">
          {/* Informations de l'entreprise */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations de l'Entreprise
              {demandeId && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Pré-rempli
                </span>
              )}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Raison sociale *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.raisonSociale}
                  onChange={(e) => handleInputChange('raisonSociale', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° RCCM *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.numeroRccm}
                  onChange={(e) => handleInputChange('numeroRccm', e.target.value)}
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.secteurActivite}
                  onChange={(e) => handleInputChange('secteurActivite', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Effectif *
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.effectif}
                  onChange={(e) => handleInputChange('effectif', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact DRH *
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.contactDrh}
                  onChange={(e) => handleInputChange('contactDrh', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Type de contrat et tarification */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Type de Contrat et Tarification
            </h2>
            
            {/* Recommandation automatique */}
            {formData.secteurActivite && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Secteur détecté : {formData.secteurActivite}</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Contrat recommandé : <strong>{getRecommendedContractType(formData.secteurActivite) === 'INDUSTRIE_PETROLIERE' ? '🔥 INDUSTRIE PÉTROLIÈRE' : '📋 STANDARD'}</strong>
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de contrat *
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="typeContrat"
                      value="STANDARD"
                      checked={formData.typeContrat === 'STANDARD'}
                      onChange={(e) => handleInputChange('typeContrat', e.target.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="font-medium">Contrat Standard</p>
                      <p className="text-sm text-gray-500">15,000 FCFA/employé/an</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="typeContrat"
                      value="INDUSTRIE_PETROLIERE"
                      checked={formData.typeContrat === 'INDUSTRIE_PETROLIERE'}
                      onChange={(e) => handleInputChange('typeContrat', e.target.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="font-medium">Contrat Industrie Pétrolière</p>
                      <p className="text-sm text-gray-500">45,000 FCFA/employé/an</p>
                      {getRecommendedContractType(formData.secteurActivite) === 'INDUSTRIE_PETROLIERE' && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                          Recommandé
                        </span>
                      )}
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="typeContrat"
                      value="SPECIAL"
                      checked={formData.typeContrat === 'SPECIAL'}
                      onChange={(e) => handleInputChange('typeContrat', e.target.value)}
                      className="text-blue-600"
                    />
                    <div>
                      <p className="font-medium">Contrat Spécial</p>
                      <p className="text-sm text-gray-500">Tarif négocié</p>
                    </div>
                  </label>
                </div>
              </div>
              
              {formData.typeContrat === 'SPECIAL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarif personnalisé (FCFA/employé/an) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.tarifPersonnalise || ''}
                    onChange={(e) => handleInputChange('tarifPersonnalise', parseInt(e.target.value) || 0)}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Calculs automatiques */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calcul Automatique des Tarifs
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Effectif entreprise</p>
                  <p className="text-xl font-bold text-gray-900">{formData.effectif} employés</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tarif catégorie</p>
                  <p className="text-xl font-bold text-gray-900">{getTarifParEmploye().toLocaleString()} FCFA</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 mb-1">Total automatique</p>
                  <p className="text-2xl font-bold text-blue-900">{getTotalAnnuel().toLocaleString()} FCFA/an</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Répartition trimestrielle :</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>• Trimestre 1 : {getTotalTrimestre().toLocaleString()} FCFA</div>
                  <div>• Trimestre 2 : {getTotalTrimestre().toLocaleString()} FCFA</div>
                  <div>• Trimestre 3 : {getTotalTrimestre().toLocaleString()} FCFA</div>
                  <div>• Trimestre 4 : {getTotalTrimestre().toLocaleString()} FCFA</div>
                </div>
              </div>
            </div>
          </div>

          {/* Paramètres du contrat */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres du Contrat</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zone médicale
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.zoneMedicale}
                  onChange={(e) => handleInputChange('zoneMedicale', e.target.value)}
                >
                  <option value="">Sélectionner une zone</option>
                  <option value="Ouagadougou Nord">Ouagadougou Nord</option>
                  <option value="Ouagadougou Sud">Ouagadougou Sud</option>
                  <option value="Ouagadougou Centre">Ouagadougou Centre</option>
                  <option value="Ouagadougou Est">Ouagadougou Est</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.dateDebut}
                  onChange={(e) => handleInputChange('dateDebut', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée (mois)
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.duree}
                  onChange={(e) => handleInputChange('duree', parseInt(e.target.value))}
                >
                  <option value={6}>6 mois</option>
                  <option value={12}>12 mois</option>
                  <option value={24}>24 mois</option>
                  <option value={36}>36 mois</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaires
              </label>
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.commentaires}
                onChange={(e) => handleInputChange('commentaires', e.target.value)}
                placeholder="Commentaires ou conditions particulières..."
              />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/contrats')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={createContratMutation.isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {createContratMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Création...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Créer le Contrat
                </>
              )}
            </button>
          </div>
        </div>

        {/* Aperçu en temps réel */}
        {showPreview && (
          <div className="bg-white rounded-lg border p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Aperçu du Contrat
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {generateContractPreview()}
              </pre>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Aperçu en temps réel</p>
                  <p>Le contrat se met à jour automatiquement selon vos modifications.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContratCreationAvance;
