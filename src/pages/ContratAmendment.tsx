import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { 
  Edit3, 
  ArrowLeft, 
  Save, 
  AlertTriangle,
  FileText,
  Building2,
  Calendar,
  DollarSign,
  Users
} from 'lucide-react';
import { contratAPI } from '../services/api';
import { Contrat } from '../types';

const ContratAmendment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    motifAmendement: '',
    effectif: '',
    tarifAnnuel: '',
    dateDebut: '',
    dateFin: '',
    zoneMedicale: '',
    commentaires: ''
  });

  const [selectedMotif, setSelectedMotif] = useState('');

  // Récupérer le contrat existant
  const { data: contrat, isLoading } = useQuery({
    queryKey: ['contrat', id],
    queryFn: async () => {
      const response = await contratAPI.getById(parseInt(id!));
      return response.data;
    },
    onSuccess: (data: Contrat) => {
      // Pré-remplir le formulaire avec les données existantes
      setFormData({
        motifAmendement: '',
        effectif: data.demandeAffiliation?.effectif?.toString() || '',
        tarifAnnuel: data.tarifAnnuel?.toString() || '',
        dateDebut: data.dateDebut || '',
        dateFin: data.dateFin || '',
        zoneMedicale: data.zoneMedicale || '',
        commentaires: ''
      });
    }
  });

  // Mutation pour créer l'amendement
  const amendmentMutation = useMutation({
    mutationFn: async (amendmentData: any) => {
      const response = await contratAPI.amender(parseInt(id!), amendmentData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Amendement créé avec succès !');
      queryClient.invalidateQueries(['contrats']);
      navigate('/contrats');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création de l\'amendement');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedMotif && !formData.motifAmendement) {
      toast.error('Le motif de l\'amendement est obligatoire');
      return;
    }

    const amendmentData = {
      ...formData,
      motifAmendement: selectedMotif === 'autre' ? formData.motifAmendement : selectedMotif,
      effectif: parseInt(formData.effectif) || 0,
      tarifAnnuel: parseFloat(formData.tarifAnnuel) || 0
    };

    amendmentMutation.mutate(amendmentData);
  };

  const calculateTarif = (effectif: number) => {
    // Logique de calcul du tarif basée sur l'effectif
    const tarifParEmploye = 45000; // Exemple : 45k FCFA par employé
    return effectif * tarifParEmploye;
  };

  const handleEffectifChange = (value: string) => {
    setFormData(prev => {
      const effectif = parseInt(value) || 0;
      const nouveauTarif = calculateTarif(effectif);
      return {
        ...prev,
        effectif: value,
        tarifAnnuel: nouveauTarif.toString()
      };
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!contrat) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Contrat non trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/contrats')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Edit3 className="h-6 w-6" />
            Amendement du Contrat {contrat.numeroContrat}
          </h1>
          <p className="text-gray-600 mt-1">
            Modifier les termes du contrat existant
          </p>
        </div>
      </div>

      {/* Informations du contrat actuel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contrat Actuel - Version {contrat.version}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm">
              <strong>Entreprise:</strong> {contrat.demandeAffiliation?.raisonSociale}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm">
              <strong>Effectif:</strong> {contrat.demandeAffiliation?.effectif} employés
            </span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span className="text-sm">
              <strong>Tarif:</strong> {formatCurrency(contrat.tarifAnnuel)}
            </span>
          </div>
        </div>
      </div>

      {/* Formulaire d'amendement */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Motif de l'Amendement
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison de la modification *
              </label>
              <div className="space-y-2">
                {[
                  'Changement d\'effectif',
                  'Modification d\'activité',
                  'Changement d\'adresse',
                  'Erreur dans le contrat original',
                  'Autre'
                ].map((motif) => (
                  <label key={motif} className="flex items-center">
                    <input
                      type="radio"
                      name="motif"
                      value={motif.toLowerCase().replace(/\s+/g, '_')}
                      checked={selectedMotif === motif.toLowerCase().replace(/\s+/g, '_')}
                      onChange={(e) => setSelectedMotif(e.target.value)}
                      className="mr-2"
                    />
                    {motif}
                  </label>
                ))}
              </div>
            </div>

            {selectedMotif === 'autre' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Précisez le motif *
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.motifAmendement}
                  onChange={(e) => setFormData(prev => ({ ...prev, motifAmendement: e.target.value }))}
                  placeholder="Décrivez la raison de l'amendement..."
                  required
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Modifications à Apporter
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouvel effectif
              </label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.effectif}
                onChange={(e) => handleEffectifChange(e.target.value)}
                placeholder="Nombre d'employés"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau tarif annuel (calculé automatiquement)
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50"
                value={formatCurrency(parseFloat(formData.tarifAnnuel) || 0)}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.dateDebut}
                onChange={(e) => setFormData(prev => ({ ...prev, dateDebut: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin
              </label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.dateFin}
                onChange={(e) => setFormData(prev => ({ ...prev, dateFin: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone médicale
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.zoneMedicale}
                onChange={(e) => setFormData(prev => ({ ...prev, zoneMedicale: e.target.value }))}
                placeholder="Zone médicale de rattachement"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaires additionnels
              </label>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.commentaires}
                onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
                placeholder="Commentaires ou notes sur l'amendement..."
              />
            </div>
          </div>
        </div>

        {/* Résumé des changements */}
        {(formData.effectif !== contrat.demandeAffiliation?.effectif?.toString() || 
          formData.tarifAnnuel !== contrat.tarifAnnuel?.toString()) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Résumé des changements :</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              {formData.effectif !== contrat.demandeAffiliation?.effectif?.toString() && (
                <li>
                  • Effectif : {contrat.demandeAffiliation?.effectif} → {formData.effectif} employés
                </li>
              )}
              {formData.tarifAnnuel !== contrat.tarifAnnuel?.toString() && (
                <li>
                  • Cotisation annuelle : {formatCurrency(contrat.tarifAnnuel)} → {formatCurrency(parseFloat(formData.tarifAnnuel) || 0)}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/contrats')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={amendmentMutation.isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {amendmentMutation.isLoading ? 'Création...' : 'Créer l\'amendement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContratAmendment;
