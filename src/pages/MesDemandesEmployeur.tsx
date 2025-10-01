import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, User } from 'lucide-react';

interface Certificat {
  id: number;
  consultation_id: number;
  travailleur_nom: string;
  travailleur_prenom: string;
  entreprise_nom: string;
  aptitude: string;
  observations: string;
  restrictions: string;
  date_validite: string;
  date_generation: string;
  nom_patient?: string;
  resultat?: string;
}

const MesDemandesEmployeur: React.FC = () => {
  const [certificats, setCertificats] = useState<Certificat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificats();
  }, []);

  const fetchCertificats = async () => {
    try {
      const employeurEmail = 'employeur@test.com';
      const response = await fetch(`http://localhost:8080/api/consultations/certificats/${encodeURIComponent(employeurEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setCertificats(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des certificats:', error);
    } finally {
      setLoading(false);
    }
  };

  const telechargerCertificat = async (certificat: any) => {
    try {
      const response = await fetch(`http://localhost:8080/api/consultations/certificat/pdf/${certificat.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.href = url;
        element.download = `certificat_${certificat.travailleur_nom || certificat.nom_patient}_${certificat.travailleur_prenom || ''}.pdf`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du certificat');
    }
  };

  const getResultatColor = (resultat: string) => {
    switch (resultat) {
      case 'APTE': return 'text-green-600 bg-green-100';
      case 'INAPTE': return 'text-red-600 bg-red-100';
      case 'APTE_AVEC_RESERVES': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <FileText className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Mes Demandes & Certificats</h1>
        </div>

        {certificats.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun certificat</h3>
            <p className="text-gray-500">Vous n'avez pas encore de certificats médicaux.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {certificats.map((certificat) => (
              <div key={certificat.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Certificat médical - {certificat.travailleur_nom || certificat.nom_patient} {certificat.travailleur_prenom || ''}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {certificat.entreprise_nom}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getResultatColor(certificat.aptitude || certificat.resultat)}`}>
                    {certificat.aptitude || certificat.resultat}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Date de génération: {new Date(certificat.date_generation || certificat.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Valide jusqu'au: {certificat.date_validite ? new Date(certificat.date_validite).toLocaleDateString('fr-FR') : 'Non spécifié'}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Observations:</h4>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{certificat.observations}</p>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => telechargerCertificat(certificat)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesDemandesEmployeur;