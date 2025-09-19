import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  Building,
  FileText,
  User,
  Save,
  ArrowLeft,
  CheckCircle,
  Info
} from 'lucide-react';

// Types
interface DemandeAffiliationFormData {
  raisonSociale: string;
  numeroRccm: string;
  secteurActivite: string;
  effectif: number;
  adresse: string;
  representantLegal: string;
  email: string;
  telephone: string;
  contactDrh: string;
  chiffreAffaireAnnuel?: number;
  commentaires?: string;
}

// Import de l'API
import { demandeAffiliationAPI } from '../services/api';

const DemandeAffiliationEmployeur: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isSubmittingRef = useRef(false);

  const [formData, setFormData] = useState<DemandeAffiliationFormData>({
    raisonSociale: '',
    numeroRccm: '',
    secteurActivite: '',
    effectif: 0,
    adresse: '',
    representantLegal: '',
    email: '',
    telephone: '',
    contactDrh: '',
    chiffreAffaireAnnuel: undefined,
    commentaires: ''
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      isSubmittingRef.current = false;
    };
  }, []);

  // Mutation pour créer la demande
  const createDemandeMutation = useMutation({
    mutationFn: demandeAffiliationAPI.create,
    onSuccess: async () => {
      toast.success('Demande d\'affiliation soumise avec succès !');
      toast('Votre demande sera examinée par le directeur régional', {
        icon: 'ℹ️',
        duration: 4000,
      });

      // Invalider le cache
      await queryClient.invalidateQueries({ queryKey: ['mes-demandes-affiliation'] });

      // Navigation immédiate
      navigate('/mes-demandes-affiliation', { replace: true });
    },
    onError: (error: any) => {
      console.error('Erreur complète:', error);
      toast.error(`Erreur lors de la soumission: ${error.message || 'Erreur inconnue'}`);
      isSubmittingRef.current = false; // Reset submission flag on error
    },
    onSettled: () => {
      isSubmittingRef.current = false; // Always reset submission flag
    }
  });

  // Validation
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.raisonSociale.trim()) newErrors.raisonSociale = 'Raison sociale requise';
      if (!formData.numeroRccm.trim()) newErrors.numeroRccm = 'Numéro RCCM requis';
      if (!formData.secteurActivite.trim()) newErrors.secteurActivite = 'Secteur d\'activité requis';
      if (formData.effectif <= 0) newErrors.effectif = 'Effectif doit être supérieur à 0';
    } else if (step === 2) {
      if (!formData.adresse.trim()) newErrors.adresse = 'Adresse requise';
      if (!formData.representantLegal.trim()) newErrors.representantLegal = 'Représentant légal requis';
      if (!formData.email.trim()) newErrors.email = 'Email requis';
      if (!formData.telephone.trim()) newErrors.telephone = 'Téléphone requis';
      if (!formData.contactDrh.trim()) newErrors.contactDrh = 'Contact DRH requis';
      
      // Validation email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Format d\'email invalide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmittingRef.current || createDemandeMutation.isPending) {
      return;
    }

    if (validateStep(2)) {
      isSubmittingRef.current = true;
      createDemandeMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof DemandeAffiliationFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = field === 'effectif' || field === 'chiffreAffaireAnnuel' 
      ? parseFloat(e.target.value) || 0 
      : e.target.value;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Supprimer l'erreur si le champ devient valide
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const secteurs = [
    'Agriculture et Agroalimentaire',
    'BTP et Construction',
    'Commerce et Distribution',
    'Éducation et Formation',
    'Énergie et Mines',
    'Finance et Assurance',
    'Industrie Manufacturière',
    'Informatique et Télécommunications',
    'Santé et Services Sociaux',
    'Services aux Entreprises',
    'Transport et Logistique',
    'Tourisme et Hôtellerie',
    'Autre'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Demande d'Affiliation</h1>
          <p className="mt-2 text-gray-600">
            Soumettez votre demande d'affiliation au système de registre médical
          </p>
        </div>

        {/* Indicateur d'étapes */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`} />
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}>
                3
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2 space-x-8">
            <span className={`text-sm ${currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Informations Entreprise
            </span>
            <span className={`text-sm ${currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Contacts & Détails
            </span>
            <span className={`text-sm ${currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Confirmation
            </span>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white shadow-xl rounded-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Étape 1: Informations Entreprise */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Informations sur l'Entreprise
                  </h2>
                  <p className="text-gray-600 mt-1">Renseignez les informations de base de votre entreprise</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Raison Sociale *
                    </label>
                    <input
                      type="text"
                      value={formData.raisonSociale}
                      onChange={handleInputChange('raisonSociale')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.raisonSociale ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: SARL TechnoServices"
                    />
                    {errors.raisonSociale && (
                      <p className="mt-1 text-sm text-red-600">{errors.raisonSociale}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numéro RCCM *
                    </label>
                    <input
                      type="text"
                      value={formData.numeroRccm}
                      onChange={handleInputChange('numeroRccm')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.numeroRccm ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Ex: BF-OUA-2023-B-12345"
                    />
                    {errors.numeroRccm && (
                      <p className="mt-1 text-sm text-red-600">{errors.numeroRccm}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secteur d'Activité *
                    </label>
                    <select
                      value={formData.secteurActivite}
                      onChange={handleInputChange('secteurActivite')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.secteurActivite ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Sélectionnez un secteur</option>
                      {secteurs.map(secteur => (
                        <option key={secteur} value={secteur}>{secteur}</option>
                      ))}
                    </select>
                    {errors.secteurActivite && (
                      <p className="mt-1 text-sm text-red-600">{errors.secteurActivite}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effectif Total *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.effectif || ''}
                      onChange={handleInputChange('effectif')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.effectif ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nombre d'employés"
                    />
                    {errors.effectif && (
                      <p className="mt-1 text-sm text-red-600">{errors.effectif}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chiffre d'Affaires Annuel (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.chiffreAffaireAnnuel || ''}
                    onChange={handleInputChange('chiffreAffaireAnnuel')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optionnel"
                  />
                </div>
              </div>
            )}

            {/* Étape 2: Contacts & Détails */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contacts et Détails
                  </h2>
                  <p className="text-gray-600 mt-1">Informations de contact et représentants</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse Complète *
                  </label>
                  <textarea
                    value={formData.adresse}
                    onChange={handleInputChange('adresse')}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.adresse ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Adresse complète de l'entreprise"
                  />
                  {errors.adresse && (
                    <p className="mt-1 text-sm text-red-600">{errors.adresse}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Représentant Légal *
                    </label>
                    <input
                      type="text"
                      value={formData.representantLegal}
                      onChange={handleInputChange('representantLegal')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.representantLegal ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nom du gérant/directeur"
                    />
                    {errors.representantLegal && (
                      <p className="mt-1 text-sm text-red-600">{errors.representantLegal}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact DRH *
                    </label>
                    <input
                      type="text"
                      value={formData.contactDrh}
                      onChange={handleInputChange('contactDrh')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.contactDrh ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Nom du responsable RH"
                    />
                    {errors.contactDrh && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactDrh}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange('email')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="contact@entreprise.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={handleInputChange('telephone')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.telephone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+226 XX XX XX XX"
                    />
                    {errors.telephone && (
                      <p className="mt-1 text-sm text-red-600">{errors.telephone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaires Additionnels
                  </label>
                  <textarea
                    value={formData.commentaires}
                    onChange={handleInputChange('commentaires')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Informations supplémentaires que vous souhaitez communiquer..."
                  />
                </div>
              </div>
            )}

            {/* Étape 3: Confirmation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Confirmation
                  </h2>
                  <p className="text-gray-600 mt-1">Vérifiez vos informations avant soumission</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Raison Sociale</h4>
                      <p className="text-gray-600">{formData.raisonSociale}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">RCCM</h4>
                      <p className="text-gray-600">{formData.numeroRccm}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Secteur</h4>
                      <p className="text-gray-600">{formData.secteurActivite}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Effectif</h4>
                      <p className="text-gray-600">{formData.effectif} employés</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Représentant Légal</h4>
                      <p className="text-gray-600">{formData.representantLegal}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Contact</h4>
                      <p className="text-gray-600">{formData.email}</p>
                      <p className="text-gray-600">{formData.telephone}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Adresse</h4>
                    <p className="text-gray-600">{formData.adresse}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Processus de validation</h4>
                      <p className="text-blue-800 text-sm mt-1">
                        Votre demande sera examinée par le directeur régional. Vous recevrez une notification 
                        par email une fois la décision prise. Le processus peut prendre 2-5 jours ouvrables.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Boutons de navigation */}
            <div className="mt-8 flex justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Précédent
                  </button>
                )}
              </div>

              <div>
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    Suivant
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={createDemandeMutation.isPending}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {createDemandeMutation.isPending ? 'Soumission...' : 'Soumettre la Demande'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DemandeAffiliationEmployeur;
