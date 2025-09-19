import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { travailleurAPI, entrepriseAPI } from '../services/api';
import { Travailleur } from '../types';
import { User, Plus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface TravailleurFormData {
  nom: string;
  prenom: string;
  matricule: string;
  dateNaissance: string;
  poste: string;
  dateEmbauche: string;
  telephone: string;
  email: string;
  adresse: string;
  expositionsProfessionnelles: { nom: string }[];
}

const TravailleurForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [entreprises, setEntreprises] = useState<any[]>([]);
  const [selectedEntrepriseId, setSelectedEntrepriseId] = useState<number | null>(null);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<TravailleurFormData>({
    defaultValues: {
      nom: '',
      prenom: '',
      matricule: '',
      dateNaissance: '',
      poste: '',
      dateEmbauche: '',
      telephone: '',
      email: '',
      adresse: '',
      expositionsProfessionnelles: [{ nom: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "expositionsProfessionnelles"
  });

  useEffect(() => {
    if (id) {
      fetchTravailleur();
    }
    fetchEntreprises();
  }, [id]);

  const fetchEntreprises = async () => {
    try {
      const res = await entrepriseAPI.getAll();
      const list = res.data || [];
      setEntreprises(list);
      // S'il n'y en a qu'une, la sélectionner par défaut
      if (list.length === 1) setSelectedEntrepriseId(list[0].id);
    } catch (e) {
      console.error('Erreur chargement entreprises', e);
    }
  };

  const fetchTravailleur = async () => {
    if (!id) return;
    
    try {
      const response = await travailleurAPI.getById(parseInt(id));
      const travailleur: Travailleur = response.data;
      
      setValue('nom', travailleur.nom || '');
      setValue('prenom', travailleur.prenom || '');
      setValue('matricule', travailleur.matricule || '');
      setValue('dateNaissance', travailleur.dateNaissance || '');
      setValue('poste', travailleur.poste || '');
      setValue('dateEmbauche', travailleur.dateEmbauche || '');
      setValue('telephone', travailleur.telephone || '');
      setValue('email', travailleur.email || '');
      setValue('adresse', travailleur.adresse || '');
      
      if (travailleur.expositionsProfessionnelles && travailleur.expositionsProfessionnelles.length > 0) {
        setValue('expositionsProfessionnelles', 
          travailleur.expositionsProfessionnelles.map(exp => ({ nom: exp }))
        );
      }
    } catch (error) {
      console.error('Erreur lors du chargement du travailleur:', error);
      toast.error('Erreur lors du chargement du travailleur');
    }
  };

  const onSubmit = async (data: TravailleurFormData) => {
    setLoading(true);
    try {
      const travailleurData = {
        ...data,
        expositionsProfessionnelles: data.expositionsProfessionnelles
          .map(exp => exp.nom)
          .filter(nom => nom.trim() !== '') // Filtrer les expositions vides
      } as any;

      // Vérifier qu'une entreprise existe côté employeur
      if (!id) {
        if (!entreprises.length) {
          toast.error("Aucune entreprise associée. Créez d'abord votre entreprise.");
          setLoading(false);
          return;
        }
        // Si une entreprise choisie ou unique, l'attacher au payload
        const entrepriseId = selectedEntrepriseId ?? (entreprises[0]?.id ?? null);
        if (entrepriseId) {
          travailleurData.entreprise = { id: entrepriseId };
        }
      }

      if (id) {
        await travailleurAPI.update(parseInt(id), travailleurData);
        toast.success('Travailleur mis à jour avec succès');
      } else {
        await travailleurAPI.create(travailleurData);
        toast.success('Travailleur créé avec succès');
      }
      
      navigate('/travailleurs');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const anyErr: any = error as any;
      const status = anyErr?.response?.status;
      const msg = anyErr?.response?.data?.message || anyErr?.response?.data?.error || anyErr?.message;
      if (status === 400) {
        toast.error(msg || 'Données invalides (matricule dupliqué ou champs requis manquants)');
      } else if (status === 403) {
        toast.error("Accès interdit. Connectez-vous en EMPLOYEUR et vérifiez l'entreprise.");
      } else {
        toast.error(msg || 'Erreur lors de la sauvegarde');
      }
    } finally {
      setLoading(false);
    }
  };

  // Supprimer la variable user inutilisée ou l'utiliser
  console.log('Utilisateur connecté:', user);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {(!id && entreprises.length === 0) && (
          <div className="mb-4 p-4 rounded border border-amber-300 bg-amber-50 text-amber-800">
            Aucune entreprise associée. Créez d'abord votre entreprise.
            <button
              type="button"
              onClick={() => navigate('/entreprises/nouvelle')}
              className="ml-3 inline-flex items-center px-3 py-1.5 rounded bg-blue-600 text-white text-sm"
            >Créer mon entreprise</button>
          </div>
        )}
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/travailleurs')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Modifier le travailleur' : 'Nouveau travailleur'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sélection d'entreprise si plusieurs */}
            {(!id && entreprises.length > 1) && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                <select
                  value={selectedEntrepriseId ?? ''}
                  onChange={(e) => setSelectedEntrepriseId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner</option>
                  {entreprises.map((e) => (
                    <option key={e.id} value={e.id}>{e.raisonSociale || e.nom}</option>
                  ))}
                </select>
              </div>
            )}
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
                Matricule *
              </label>
              <input
                type="text"
                {...register('matricule', { required: 'Le matricule est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.matricule && (
                <p className="mt-1 text-sm text-red-600">{errors.matricule.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de naissance *
              </label>
              <input
                type="date"
                {...register('dateNaissance', { required: 'La date de naissance est requise' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.dateNaissance && (
                <p className="mt-1 text-sm text-red-600">{errors.dateNaissance.message}</p>
              )}
            </div>

            {/* Informations professionnelles */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations professionnelles</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poste *
              </label>
              <input
                type="text"
                {...register('poste', { required: 'Le poste est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.poste && (
                <p className="mt-1 text-sm text-red-600">{errors.poste.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date d'embauche *
              </label>
              <input
                type="date"
                {...register('dateEmbauche', { required: 'La date d\'embauche est requise' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.dateEmbauche && (
                <p className="mt-1 text-sm text-red-600">{errors.dateEmbauche.message}</p>
              )}
            </div>

            {/* Contact */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                {...register('telephone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse
              </label>
              <textarea
                {...register('adresse')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Expositions professionnelles */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Expositions professionnelles</h2>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    {...register(`expositionsProfessionnelles.${index}.nom` as const)}
                    placeholder="Nom de l'exposition"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => append({ nom: '' })}
                className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter une exposition
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={() => navigate('/travailleurs')}
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

export default TravailleurForm;