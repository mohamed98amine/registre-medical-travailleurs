import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../services/api';

interface EntrepriseFormData {
  nom: string;
  secteurActivite: string;
  effectif: number;
  email: string;
  telephone: string;
  adresse: string;
  ville?: string;
  codePostal?: string;
}

interface Entreprise {
  id: number;
  nom: string;
  secteurActivite: string;
  effectif: number;
  email: string;
  telephone: string;
  adresse: string;
  ville?: string;
  codePostal?: string;
  siret?: string;
}

const EntrepriseForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const { register, handleSubmit, formState: { errors }, reset } = useForm<EntrepriseFormData>();

  // Récupérer les données de l'entreprise si on est en mode édition
  const { data: entreprise, isLoading } = useQuery({
    queryKey: ['entreprise', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await api.get(`/entreprises/${id}`);
      return response.data as Entreprise;
    },
    enabled: isEditing
  });

  // Mutation pour créer/modifier une entreprise
  const mutation = useMutation({
    mutationFn: async (data: EntrepriseFormData) => {
      if (isEditing && id) {
        return api.put(`/entreprises/${id}`, data);
      } else {
        return api.post('/entreprises', data);
      }
    },
    onSuccess: (response, data) => {
      if (isEditing) {
        toast.success('Entreprise modifiée avec succès');
      } else {
        toast.success(`Entreprise ${response.data.nom} créée avec succès! Disponible dans Programmer Visite.`);
        console.log('Nouvelle entreprise créée:', response.data);
      }
      queryClient.invalidateQueries({ queryKey: ['entreprises'] });
      navigate('/entreprises');
    },
    onError: () => {
      toast.error('Erreur lors de la sauvegarde');
    }
  });

  // Pré-remplir le formulaire en mode édition
  useEffect(() => {
    if (entreprise) {
      reset({
        nom: entreprise.nom,
        secteurActivite: entreprise.secteurActivite,
        effectif: entreprise.effectif,
        email: entreprise.email,
        telephone: entreprise.telephone,
        adresse: entreprise.adresse,
        ville: entreprise.ville || '',
        codePostal: entreprise.codePostal || '',
      });
    }
  }, [entreprise, reset]);

  const onSubmit = (data: EntrepriseFormData) => {
    mutation.mutate(data);
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'entreprise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/entreprises')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {isEditing ? 'Modifier l\'Entreprise' : 'Créer une Entreprise'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'Modifiez les informations de l\'entreprise' : 'Remplissez les informations de la nouvelle entreprise'}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'entreprise *
                </label>
                <input
                  {...register('nom', { required: 'Le nom est requis' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Entrez le nom de l'entreprise"
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secteur d'activité *
                </label>
                <select
                  {...register('secteurActivite', { required: 'Le secteur d\'activité est requis' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionnez un secteur</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Industrie manufacturière">Industrie manufacturière</option>
                  <option value="Construction">Construction</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Transports">Transports</option>
                  <option value="Services financiers">Services financiers</option>
                  <option value="Services informatiques">Services informatiques</option>
                  <option value="Santé">Santé</option>
                  <option value="Éducation">Éducation</option>
                  <option value="Tourisme">Tourisme</option>
                  <option value="Énergie">Énergie</option>
                  <option value="Télécommunications">Télécommunications</option>
                  <option value="Autre">Autre</option>
                </select>
                {errors.secteurActivite && (
                  <p className="mt-1 text-sm text-red-600">{errors.secteurActivite.message}</p>
                )}
              </div>
            </div>

            {/* Effectif et contact */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre d'employés *
                </label>
                <input
                  {...register('effectif', {
                    required: 'Le nombre d\'employés est requis',
                    min: { value: 1, message: 'Au moins 1 employé' }
                  })}
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 50"
                />
                {errors.effectif && (
                  <p className="mt-1 text-sm text-red-600">{errors.effectif.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  {...register('email', {
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Format d\'email invalide'
                    }
                  })}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@entreprise.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  {...register('telephone', {
                    required: 'Le téléphone est requis',
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: 'Format de téléphone invalide'
                    }
                  })}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: +221 33 123 45 67"
                />
                {errors.telephone && (
                  <p className="mt-1 text-sm text-red-600">{errors.telephone.message}</p>
                )}
              </div>
            </div>

            {/* Adresse */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Adresse</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse *
                </label>
                <input
                  {...register('adresse', { required: 'L\'adresse est requise' })}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Numéro et nom de rue"
                />
                {errors.adresse && (
                  <p className="mt-1 text-sm text-red-600">{errors.adresse.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    {...register('ville')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ville"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    {...register('codePostal')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Code postal"
                  />
                </div>

              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/entreprises')}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {mutation.isPending ? 'Sauvegarde...' : (isEditing ? 'Modifier' : 'Créer')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EntrepriseForm;