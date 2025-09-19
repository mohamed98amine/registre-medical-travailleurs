import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { visiteMedicaleAPI } from '../services/api';
import { VisiteMedicale } from '../types';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface VisiteMedicaleFormData {
  type: string;
  date: string;
  travailleurId: number | string;
  examen: string;
  observations?: string;
}

const VisiteMedicaleForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<VisiteMedicaleFormData>({
    defaultValues: {
      type: 'EMBAUCHE',
      date: new Date().toISOString().split('T')[0],
      travailleurId: '',
      examen: '',
      observations: ''
    }
  });

  useEffect(() => {
    if (id) fetchVisite();
  }, [id]);

  const fetchVisite = async () => {
    if (!id) return;
    try {
      const response = await visiteMedicaleAPI.getById(parseInt(id));
      const visite: VisiteMedicale = response.data;

      setValue('type', visite.type);
      setValue('date', visite.date);
      setValue('travailleurId', visite.travailleur?.id ?? '');
      setValue('observations', visite.observations ?? '');
      // Si l’API renvoie déjà un tableau d’examens, on remplit le champ unique avec le premier élément
      setValue('examen', (visite.examens && visite.examens[0]) ? visite.examens[0] : '');
    } catch (error) {
      console.error('Erreur lors du chargement de la visite:', error);
      toast.error('Erreur lors du chargement de la visite');
    }
  };

  const onSubmit = async (data: VisiteMedicaleFormData) => {
    setLoading(true);
    try {
      const payload = {
        type: data.type,
        date: data.date,
        travailleurId: data.travailleurId,
        examens: data.examen ? [data.examen] : [],
        observations: data.observations ?? ''
      };

      if (id) {
        await visiteMedicaleAPI.update(parseInt(id), payload);
        toast.success('Visite mise à jour avec succès');
      } else {
        await visiteMedicaleAPI.create(payload);
        toast.success('Visite créée avec succès');
      }
      navigate('/visites-medicales');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/visites-medicales')}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {id ? 'Modifier la visite' : 'Nouvelle visite médicale'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de visite *</label>
              <select
                {...register('type', { required: 'Le type est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="EMBAUCHE">Embauche</option>
                <option value="PERIODIQUE">Périodique</option>
                <option value="FIN_CONTRAT">Fin de contrat</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                {...register('date', { required: 'La date est requise' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Travailleur *</label>
              <select
                {...register('travailleurId', { required: 'Le travailleur est requis' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un travailleur</option>
                {/* TODO: options dynamiques */}
              </select>
              {errors.travailleurId && <p className="mt-1 text-sm text-red-600">{errors.travailleurId.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Examen</label>
              <textarea
                {...register('examen')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Détails de l'examen médical..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Observations</label>
              <textarea
                {...register('observations')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observations médicales..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={() => navigate('/visites-medicales')} className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Sauvegarde...' : (id ? 'Mettre à jour' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VisiteMedicaleForm;
