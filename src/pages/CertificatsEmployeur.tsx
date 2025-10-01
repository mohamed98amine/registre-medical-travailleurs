import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, User, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
}

const CertificatsEmployeur: React.FC = () => {
  const [certificats, setCertificats] = useState<Certificat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificats();
  }, []);

  const fetchCertificats = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/consultations/certificats/employeur@test.com`);
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

  const telechargerCertificat = async (certificat: Certificat) => {
    try {
      const response = await fetch(`http://localhost:8080/api/consultations/certificat/pdf/${certificat.id}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.href = url;
        element.download = `certificat_${certificat.travailleur_nom}_${certificat.travailleur_prenom}.pdf`;
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

  const getAptitudeIcon = (aptitude: string) => {
    switch (aptitude) {
      case 'APTE': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'INAPTE': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'APTE_AVEC_RESTRICTIONS': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAptitudeColor = (aptitude: string) => {
    switch (aptitude) {
      case 'APTE': return 'bg-green-100 text-green-800';
      case 'INAPTE': return 'bg-red-100 text-red-800';
      case 'APTE_AVEC_RESTRICTIONS': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-3xl font-bold text-gray-900">Certificats Médicaux</h1>
        </div>

        {certificats.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun certificat</h3>
            <p className="text-gray-500">Vous n'avez pas encore reçu de certificats médicaux.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {certificats.map((certificat) => (
              <div key={certificat.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getAptitudeIcon(certificat.aptitude)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {certificat.travailleur_nom} {certificat.travailleur_prenom}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {certificat.entreprise_nom}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getAptitudeColor(certificat.aptitude)}`}>
                    {getAptitudeIcon(certificat.aptitude)}
                    <span>{certificat.aptitude.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Généré le: {new Date(certificat.date_generation).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {certificat.date_validite && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Valide jusqu'au: {new Date(certificat.date_validite).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                {certificat.observations && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Observations:</h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{certificat.observations}</p>
                  </div>
                )}

                {certificat.restrictions && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Restrictions:</h4>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">{certificat.restrictions}</p>
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={() => telechargerCertificat(certificat)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Télécharger PDF</span>
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

export default CertificatsEmployeur;