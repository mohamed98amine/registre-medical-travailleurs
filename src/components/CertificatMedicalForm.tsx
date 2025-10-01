import React, { useState, useEffect } from 'react';
import { X, FileText, Users } from 'lucide-react';

interface CertificatMedicalFormProps {
  consultation: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CertificatMedicalForm: React.FC<CertificatMedicalFormProps> = ({
  consultation,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    aptitude: '',
    observations: '',
    restrictions: '',
    dateValidite: '',
    travailleursSelectionnes: []
  });
  const [travailleurs, setTravailleurs] = useState([]);

  useEffect(() => {
    const fetchTravailleurs = async () => {
      try {
        console.log('Chargement travailleurs pour consultation:', consultation.id);
        const response = await fetch(`http://localhost:8080/api/consultations/consultation/${consultation.id}/travailleurs`);
        if (response.ok) {
          const data = await response.json();
          console.log('Travailleurs reçus:', data);
          setTravailleurs(data);
        } else {
          console.error('Erreur response:', response.status);
          throw new Error('Erreur API');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des travailleurs MySQL:', error);
        setTravailleurs([]);
        alert('Impossible de charger les travailleurs depuis MySQL. Vérifiez la connexion à la base de données.');
      }
    };
    
    if (consultation?.id) {
      fetchTravailleurs();
    }
  }, [consultation]);

  const handleTravailleurChange = (travailleurId, checked) => {
    if (checked) {
      setFormData({
        ...formData,
        travailleursSelectionnes: [...formData.travailleursSelectionnes, travailleurId]
      });
    } else {
      setFormData({
        ...formData,
        travailleursSelectionnes: formData.travailleursSelectionnes.filter(id => id !== travailleurId)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.travailleursSelectionnes.length === 0) {
      alert('Veuillez sélectionner au moins un travailleur');
      return;
    }
    
    const travailleursSelectionnes = travailleurs.filter(t => 
      formData.travailleursSelectionnes.includes(t.id)
    );
    
    onSubmit({
      ...formData,
      consultationId: consultation.id,
      travailleursSelectionnes: travailleursSelectionnes
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Certificat Médical</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Informations de la consultation</h3>
          <p><strong>Type:</strong> {consultation.type_visite}</p>
          <p><strong>Spécialité:</strong> {consultation.specialite}</p>
          <p><strong>Date souhaitée:</strong> {new Date(consultation.date_souhaitee).toLocaleDateString('fr-FR')}</p>
          <p><strong>Motif:</strong> {consultation.motif}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aptitude au travail *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="aptitude"
                  value="APTE"
                  checked={formData.aptitude === 'APTE'}
                  onChange={(e) => setFormData({...formData, aptitude: e.target.value})}
                  className="mr-2"
                  required
                />
                <span className="text-green-600 font-medium">APTE</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="aptitude"
                  value="APTE_AVEC_RESTRICTIONS"
                  checked={formData.aptitude === 'APTE_AVEC_RESTRICTIONS'}
                  onChange={(e) => setFormData({...formData, aptitude: e.target.value})}
                  className="mr-2"
                />
                <span className="text-yellow-600 font-medium">APTE AVEC RESTRICTIONS</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="aptitude"
                  value="INAPTE"
                  checked={formData.aptitude === 'INAPTE'}
                  onChange={(e) => setFormData({...formData, aptitude: e.target.value})}
                  className="mr-2"
                />
                <span className="text-red-600 font-medium">INAPTE</span>
              </label>
            </div>
          </div>

          {formData.aptitude === 'APTE_AVEC_RESTRICTIONS' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restrictions
              </label>
              <textarea
                value={formData.restrictions}
                onChange={(e) => setFormData({...formData, restrictions: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Précisez les restrictions..."
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observations médicales
            </label>
            <textarea
              value={formData.observations}
              onChange={(e) => setFormData({...formData, observations: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observations, recommandations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner les travailleurs * ({travailleurs.length} disponibles)
            </label>
            <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
              {travailleurs.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>Aucun travailleur trouvé dans MySQL</p>
                  <p className="text-sm mt-1">Vérifiez que la table 'travailleurs' contient des données</p>
                </div>
              ) : (
                travailleurs.map((travailleur) => (
                  <label key={travailleur.id} className="flex items-center mb-2 hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={formData.travailleursSelectionnes.includes(travailleur.id)}
                      onChange={(e) => handleTravailleurChange(travailleur.id, e.target.checked)}
                      className="mr-3"
                    />
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium">{travailleur.nom} {travailleur.prenom}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de validité
            </label>
            <input
              type="date"
              value={formData.dateValidite}
              onChange={(e) => setFormData({...formData, dateValidite: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Générer le certificat PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificatMedicalForm;