import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { entrepriseAPI } from '../services/api';
import { EntrepriseFormData } from '../types';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export const EntrepriseForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<EntrepriseFormData>({
    defaultValues: {
      raisonSociale: '',
      secteurActivite: '',
      effectif: 0,
      adresse: '',
      telephone: '',
      email: '',
      zoneAffectation: ''
    }
  });

  useEffect(() => {
    if (id) {
      fetchEntreprise();
    }
  }, [id]);

  const fetchEntreprise = async () => {
    if (!id) return;
    
    try {
      const response = await entrepriseAPI.getById(parseInt(id));
      const entreprise = response.data;
      
      setValue('raisonSociale', entreprise.raisonSociale);
      setValue('secteurActivite', entreprise.secteurActivite);
      setValue('effectif', entreprise.effectif);
      setValue('adresse', entreprise.adresse);
      setValue('telephone', entreprise.telephone);
      setValue('email', entreprise.email);
      setValue('zoneAffectation', entreprise.zoneAffectation);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'entreprise:', error);
      toast.error('Erreur lors du chargement de l\'entreprise');
    }
  };

  const onSubmit = async (data: EntrepriseFormData) => {
    setLoading(true);
    try {
      if (id) {
        await entrepriseAPI.update(parseInt(id), data);
        toast.success('Entreprise mise à jour avec succès');
      } else {
        await entrepriseAPI.create(data);
        toast.success('Entreprise créée avec succès');
      }
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      const status = error?.response?.status;
      const msg = error?.response?.data?.message || error?.response?.data?.error || error?.message;
      
      if (status === 400) {
        toast.error(msg || 'Données invalides');
      } else if (status === 403) {
        toast.error("Accès interdit. Connectez-vous en EMPLOYEUR.");
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
            onClick={() => navigate('/dashboard')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison sociale *
              </label>
              <input
                type="text"
                {...register('raisonSociale', { required: 'La raison sociale est requise' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de l'entreprise"
              />
              {errors.raisonSociale && (
                <p className="mt-1 text-sm text-red-600">{errors.raisonSociale.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur d'activité *
              </label>
              <input
                type="text"
                {...register('secteurActivite', { required: 'Le secteur d\'activité est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Industrie, Services, etc."
              />
              {errors.secteurActivite && (
                <p className="mt-1 text-sm text-red-600">{errors.secteurActivite.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Effectif *
              </label>
              <input
                type="number"
                {...register('effectif', { 
                  required: 'L\'effectif est requis', 
                  min: { value: 1, message: 'L\'effectif doit être au moins 1' },
                  valueAsNumber: true
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre d'employés"
              />
              {errors.effectif && (
                <p className="mt-1 text-sm text-red-600">{errors.effectif.message}</p>
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
                placeholder="Numéro de téléphone"
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
                {...register('email', { 
                  required: 'L\'email est requis',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="contact@entreprise.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone d'affectation
              </label>
              <input
                type="text"
                {...register('zoneAffectation')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Zone géographique"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <textarea
                {...register('adresse', { required: 'L\'adresse est requise' })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adresse complète de l'entreprise"
              />
              {errors.adresse && (
                <p className="mt-1 text-sm text-red-600">{errors.adresse.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
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

export default EntrepriseForm;