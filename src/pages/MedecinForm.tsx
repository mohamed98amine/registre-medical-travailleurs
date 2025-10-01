import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { medecinAPI } from '../services/api';
import { Medecin } from '../types';
import { User, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface MedecinFormData {
  nom: string;
  prenom: string;
  specialite: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  codePostal: string;
}

const MedecinForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MedecinFormData>({
    defaultValues: {
      nom: '',
      prenom: '',
      specialite: '',
      telephone: '',
      email: '',
      adresse: '',
      ville: '',
      codePostal: ''
    }
  });

  useEffect(() => {
    if (id) {
      fetchMedecin();
    }
  }, [id]);

  const fetchMedecin = async () => {
    if (!id) return;

    try {
      const response = await medecinAPI.getById(parseInt(id));
      const medecin: Medecin = response.data;

      setValue('nom', medecin.nom || '');
      setValue('prenom', medecin.prenom || '');
      setValue('specialite', medecin.specialite || '');
      setValue('telephone', medecin.telephone || '');
      setValue('email', medecin.email || '');
      setValue('adresse', medecin.adresse || '');
      setValue('ville', medecin.ville || '');
      setValue('codePostal', medecin.codePostal || '');
    } catch (error) {
      console.error('Erreur lors du chargement du médecin:', error);
      toast.error('Erreur lors du chargement du médecin');
    }
  };

  const onSubmit = async (data: MedecinFormData) => {
    setLoading(true);
    try {
      if (id) {
        await medecinAPI.update(parseInt(id), data);
        toast.success('Médecin mis à jour avec succès');
      } else {
        await medecinAPI.create(data);
        toast.success('Médecin créé avec succès');
      }

      navigate('/medecins');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const anyErr: any = error as any;
      const status = anyErr?.response?.status;
      const msg = anyErr?.response?.data?.message || anyErr?.response?.data?.error || anyErr?.message;
      if (status === 400) {
        toast.error(msg || 'Données invalides');
      } else if (status === 403) {
        toast.error("Accès interdit.");
      } else {
        toast.error(msg || 'Erreur lors de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/medecins')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Modifier le médecin' : 'Nouveau médecin'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informations personnelles
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom *
              </label>
              <input
                type="text"
                {...register('nom', { required: 'Le nom est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.nom && (
                <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                {...register('prenom', { required: 'Le prénom est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.prenom && (
                <p className="mt-1 text-sm text-red-600">{errors.prenom.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spécialité *
              </label>
              <select
                {...register('specialite', { required: 'La spécialité est requise' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une spécialité</option>
                <option value="Médecine générale">Médecine générale</option>
                <option value="Médecine interne">Médecine interne</option>
                <option value="Cardiologie">Cardiologie</option>
                <option value="Dermatologie">Dermatologie</option>
                <option value="Endocrinologie">Endocrinologie</option>
                <option value="Gastro-entérologie">Gastro-entérologie</option>
                <option value="Gynécologie">Gynécologie</option>
                <option value="Hématologie">Hématologie</option>
                <option value="Infectiologie">Infectiologie</option>
                <option value="Néphrologie">Néphrologie</option>
                <option value="Neurologie">Neurologie</option>
                <option value="Ophtalmologie">Ophtalmologie</option>
                <option value="ORL">ORL (Oto-rhino-laryngologie)</option>
                <option value="Pédiatrie">Pédiatrie</option>
                <option value="Pneumologie">Pneumologie</option>
                <option value="Psychiatrie">Psychiatrie</option>
                <option value="Radiologie">Radiologie</option>
                <option value="Rhumatologie">Rhumatologie</option>
                <option value="Urologie">Urologie</option>
                <option value="Chirurgie générale">Chirurgie générale</option>
                <option value="Chirurgie orthopédique">Chirurgie orthopédique</option>
                <option value="Chirurgie vasculaire">Chirurgie vasculaire</option>
                <option value="Médecine du travail">Médecine du travail</option>
                <option value="Médecine d'urgence">Médecine d'urgence</option>
                <option value="Anesthésie-réanimation">Anesthésie-réanimation</option>
              </select>
              {errors.specialite && (
                <p className="mt-1 text-sm text-red-600">{errors.specialite.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                {...register('telephone', { required: 'Le téléphone est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.telephone && (
                <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                {...register('email', { required: 'L\'email est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Adresse */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h2>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <textarea
                {...register('adresse', { required: 'L\'adresse est requise' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.adresse && (
                <p className="mt-1 text-sm text-red-600">{errors.adresse.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <input
                type="text"
                {...register('ville', { required: 'La ville est requise' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.ville && (
                <p className="mt-1 text-sm text-red-600">{errors.ville.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal *
              </label>
              <input
                type="text"
                {...register('codePostal', { required: 'Le code postal est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.codePostal && (
                <p className="mt-1 text-sm text-red-600">{errors.codePostal.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/medecins')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sauvegarde...' : (id ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedecinForm;





