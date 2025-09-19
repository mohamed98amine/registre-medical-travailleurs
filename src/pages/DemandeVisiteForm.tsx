import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { travailleurAPI } from '../services/api';
import { Travailleur } from '../types';
import { Calendar, Users, Stethoscope, User, Plus, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DemandeVisiteFormData {
  typeVisite: string;
  specialite: string;
  medecinId: string;
  dateSouhaitee: string;
  motif: string;
  travailleurIds: number[];
}

const SPECIALITES = [
  { value: 'GENERALISTE', label: 'Médecine générale' },
  { value: 'CARDIOLOGUE', label: 'Cardiologie' },
  { value: 'OPHTHALMOLOGUE', label: 'Ophtalmologie' },
  { value: 'DERMATOLOGUE', label: 'Dermatologie' },
  { value: 'ORTHOPEDISTE', label: 'Orthopédie' },
  { value: 'NEUROLOGUE', label: 'Neurologie' },
  { value: 'PSYCHIATRE', label: 'Psychiatrie' },
  { value: 'PNEUMOLOGUE', label: 'Pneumologie' },
  { value: 'GASTROENTEROLOGUE', label: 'Gastro-entérologie' },
  { value: 'UROLOGUE', label: 'Urologie' },
  { value: 'GYNECOLOGUE', label: 'Gynécologie' },
  { value: 'PEDIATRE', label: 'Pédiatrie' },
  { value: 'RADIOLOGUE', label: 'Radiologie' },
  { value: 'ANESTHESISTE', label: 'Anesthésie' },
  { value: 'CHIRURGIEN', label: 'Chirurgie' }
];

const TYPES_VISITE = [
  { value: 'EMBAUCHE', label: 'Embauche' },
  { value: 'PERIODIQUE', label: 'Périodique' },
  { value: 'FIN_CONTRAT', label: 'Fin de contrat' },
  { value: 'REPRISE', label: 'Reprise' }
];

const DemandeVisiteForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [travailleurs, setTravailleurs] = useState<Travailleur[]>([]);
  const [medecins, setMedecins] = useState<any[]>([]);
  const [selectedTravailleurs, setSelectedTravailleurs] = useState<number[]>([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<DemandeVisiteFormData>({
    defaultValues: {
      typeVisite: '',
      specialite: '',
      medecinId: '',
      dateSouhaitee: '',
      motif: '',
      travailleurIds: []
    }
  });

  const watchedSpecialite = watch('specialite');

  useEffect(() => {
    fetchTravailleurs();
  }, []);

  useEffect(() => {
    if (watchedSpecialite) {
      fetchMedecins(watchedSpecialite);
    } else {
      setMedecins([]);
    }
  }, [watchedSpecialite]);

  const fetchTravailleurs = async () => {
    try {
      const response = await travailleurAPI.getAll();
      setTravailleurs(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des travailleurs:', error);
      toast.error('Erreur lors du chargement des travailleurs');
    }
  };

  const fetchMedecins = async (specialite: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/public/medecins/specialite/${specialite}`);
      if (response.ok) {
        const data = await response.json();
        setMedecins(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des médecins:', error);
      toast.error('Erreur lors du chargement des médecins');
    }
  };

  const toggleTravailleur = (travailleurId: number) => {
    setSelectedTravailleurs(prev => {
      const newSelection = prev.includes(travailleurId)
        ? prev.filter(id => id !== travailleurId)
        : [...prev, travailleurId];
      
      setValue('travailleurIds', newSelection);
      return newSelection;
    });
  };

  const onSubmit = async (data: DemandeVisiteFormData) => {
    if (selectedTravailleurs.length === 0) {
      toast.error('Sélectionnez au moins un travailleur');
      return;
    }

    setLoading(true);
    try {
      // Vérifier qu'un médecin est sélectionné
      if (!data.medecinId || data.medecinId === '') {
        toast.error('Veuillez sélectionner un médecin');
        return;
      }

      // Vérifier qu'au moins un travailleur est sélectionné
      if (selectedTravailleurs.length === 0) {
        toast.error('Veuillez sélectionner au moins un travailleur');
        return;
      }

      const payload = {
        ...data,
        medecinId: parseInt(data.medecinId), // Convertir en nombre
        travailleurIds: selectedTravailleurs
      };

      console.log('Payload envoyé:', payload);
      console.log('Token:', localStorage.getItem('token'));
      console.log('selectedTravailleurs:', selectedTravailleurs);
      console.log('data from form:', data);

      const response = await fetch('http://localhost:8080/api/demandes-visite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Demande de visite créée avec succès');
        navigate('/dashboard');
      } else {
        let errorMessage = 'Erreur lors de la création de la demande';
        try {
          const text = await response.text();
          try {
            const error = JSON.parse(text);
            errorMessage = error.message || error.error || errorMessage;
          } catch {
            errorMessage = text || errorMessage;
          }
        } catch (e) {
          errorMessage = 'Erreur de communication avec le serveur';
        }
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur lors de la création de la demande:', error);
      toast.error('Erreur lors de la création de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Nouvelle demande de visite
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Type de visite */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de visite *
            </label>
            <select
              {...register('typeVisite', { required: 'Le type de visite est requis' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un type</option>
              {TYPES_VISITE.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {errors.typeVisite && (
              <p className="mt-1 text-sm text-red-600">{errors.typeVisite.message}</p>
            )}
          </div>

          {/* Spécialité médicale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spécialité médicale *
            </label>
            <select
              {...register('specialite', { required: 'La spécialité est requise' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une spécialité</option>
              {SPECIALITES.map(spec => (
                <option key={spec.value} value={spec.value}>{spec.label}</option>
              ))}
            </select>
            {errors.specialite && (
              <p className="mt-1 text-sm text-red-600">{errors.specialite.message}</p>
            )}
          </div>

          {/* Médecin spécifique */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Médecin spécifique *
            </label>
            <select
              {...register('medecinId', { required: 'Le médecin est requis' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!watchedSpecialite}
            >
              <option value="">
                {!watchedSpecialite 
                  ? "Sélectionnez d'abord une spécialité" 
                  : medecins.length === 0 
                    ? "Aucun médecin disponible pour cette spécialité"
                    : "Sélectionner un médecin"
                }
              </option>
              {medecins.map(medecin => (
                <option key={medecin.id} value={medecin.id}>
                  Dr. {medecin.prenom} {medecin.nom}
                </option>
              ))}
            </select>
            {errors.medecinId && (
              <p className="mt-1 text-sm text-red-600">{errors.medecinId.message}</p>
            )}
            {watchedSpecialite && medecins.length === 0 && (
              <p className="mt-1 text-sm text-orange-600">
                Aucun médecin disponible pour la spécialité "{watchedSpecialite}". 
                Vérifiez que des médecins sont enregistrés avec cette spécialité.
              </p>
            )}
          </div>

          {/* Date souhaitée */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date souhaitée *
            </label>
            <input
              type="date"
              {...register('dateSouhaitee', { required: 'La date est requise' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.dateSouhaitee && (
              <p className="mt-1 text-sm text-red-600">{errors.dateSouhaitee.message}</p>
            )}
          </div>

          {/* Motif */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif *
            </label>
            <textarea
              {...register('motif', { required: 'Le motif est requis' })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez le motif de la visite médicale..."
            />
            {errors.motif && (
              <p className="mt-1 text-sm text-red-600">{errors.motif.message}</p>
            )}
          </div>

          {/* Sélection des travailleurs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Travailleurs concernés * ({selectedTravailleurs.length} sélectionné{selectedTravailleurs.length > 1 ? 's' : ''})
            </label>
            <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
              {travailleurs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun travailleur disponible</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {travailleurs.map(travailleur => (
                    <label
                      key={travailleur.id}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTravailleurs.includes(travailleur.id)}
                        onChange={() => toggleTravailleur(travailleur.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {travailleur.prenom} {travailleur.nom}
                        </div>
                        <div className="text-sm text-gray-500">{travailleur.poste}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || selectedTravailleurs.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Création...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Créer la demande
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DemandeVisiteForm;
