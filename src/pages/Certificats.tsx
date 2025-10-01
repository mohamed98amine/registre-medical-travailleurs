import React, { useState, useEffect } from 'react';
import { Award, Download, Eye, Search, Calendar } from 'lucide-react';

interface Certificat {
  id: number;
  numeroCertificat: string;
  employeurNom: string;
  employeurPrenom: string;
  entrepriseNom: string;
  verdict: string;
  dateVisite: string;
  envoyeEmployeur: boolean;
  dateEnvoi?: string;
}

const Certificats: React.FC = () => {
  const [certificats, setCertificats] = useState<Certificat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerdict, setFilterVerdict] = useState('');

  useEffect(() => {
    fetchCertificats();
  }, []);

  const fetchCertificats = async () => {
    try {
      const response = await fetch('/api/medecin/certificats');
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

  const handleDownload = async (certificatId: number) => {
    try {
      const response = await fetch(`/api/medecin/certificats/${certificatId}/download`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `certificat_${certificatId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const filteredCertificats = certificats.filter(cert => {
    const matchesSearch = 
      cert.employeurNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.employeurPrenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.entrepriseNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.numeroCertificat.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesVerdict = filterVerdict === '' || cert.verdict === filterVerdict;
    
    return matchesSearch && matchesVerdict;
  });

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'APTE': return 'text-green-600 bg-green-50';
      case 'INAPTE': return 'text-red-600 bg-red-50';
      case 'APTE_AVEC_RESTRICTIONS': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getVerdictText = (verdict: string) => {
    switch (verdict) {
      case 'APTE': return 'Apte';
      case 'INAPTE': return 'Inapte';
      case 'APTE_AVEC_RESTRICTIONS': return 'Apte avec restrictions';
      default: return verdict;
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes Certificats</h1>
        <p className="text-gray-600">Gestion des certificats médicaux générés</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, entreprise ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tous les verdicts</option>
            <option value="APTE">Apte</option>
            <option value="INAPTE">Inapte</option>
            <option value="APTE_AVEC_RESTRICTIONS">Apte avec restrictions</option>
          </select>
        </div>
      </div>

      {/* Liste des certificats */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verdict
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date visite
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCertificats.map((certificat) => (
                <tr key={certificat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Award className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-900">
                        {certificat.numeroCertificat}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {certificat.employeurPrenom} {certificat.employeurNom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{certificat.entrepriseNom}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVerdictColor(certificat.verdict)}`}>
                      {getVerdictText(certificat.verdict)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(certificat.dateVisite).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {certificat.envoyeEmployeur ? (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Envoyé le {certificat.dateEnvoi ? new Date(certificat.dateEnvoi).toLocaleDateString('fr-FR') : ''}
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Non envoyé
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDownload(certificat.id)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCertificats.length === 0 && (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun certificat</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterVerdict ? 'Aucun certificat ne correspond aux critères de recherche.' : 'Vous n\'avez pas encore généré de certificats.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificats;