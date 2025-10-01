import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Eye, Calendar, User } from 'lucide-react';

const DossierMedical: React.FC = () => {
  const { employeurId } = useParams<{ employeurId: string }>();
  const [dossier, setDossier] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [employeur, setEmployeur] = useState<any>(null);

  useEffect(() => {
    loadDossier();
  }, [employeurId]);

  const loadDossier = async () => {
    try {
      const response = await fetch(`/api/medecin/dossier/${employeurId}`);
      if (response.ok) {
        const data = await response.json();
        setDossier(data);
        if (data.length > 0) {
          setEmployeur({
            nom: data[0].employeur_nom
          });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <User className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dossier Médical</h1>
            <p className="text-gray-600">{employeur?.nom}</p>
          </div>
        </div>

        {dossier.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune visite trouvée</h3>
            <p className="text-gray-500">Ce travailleur n'a pas encore de visites médicales enregistrées.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {dossier.map((visite, index) => (
              <div key={visite.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {visite.type} - {new Date(visite.date).toLocaleDateString('fr-FR')}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {visite.heure} - Dr. {visite.medecin_nom} {visite.medecin_prenom}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        visite.statut === 'Terminée' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {visite.statut}
                      </span>
                      {visite.verdict && (
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getVerdictColor(visite.verdict)}`}>
                          {visite.verdict.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {visite.tension_arterielle && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="text-sm text-gray-500">Tension</div>
                        <div className="font-semibold">{visite.tension_arterielle}</div>
                      </div>
                      {visite.frequence_cardiaque && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-sm text-gray-500">Fréquence cardiaque</div>
                          <div className="font-semibold">{visite.frequence_cardiaque} bpm</div>
                        </div>
                      )}
                      {visite.poids && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-sm text-gray-500">Poids</div>
                          <div className="font-semibold">{visite.poids} kg</div>
                        </div>
                      )}
                      {visite.taille && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-sm text-gray-500">Taille</div>
                          <div className="font-semibold">{visite.taille} cm</div>
                        </div>
                      )}
                    </div>
                  )}

                  {(visite.vision_od || visite.vision_og || visite.audition) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {visite.vision_od && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-sm text-gray-500">Vision OD</div>
                          <div className="font-semibold">{visite.vision_od}</div>
                        </div>
                      )}
                      {visite.vision_og && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-sm text-gray-500">Vision OG</div>
                          <div className="font-semibold">{visite.vision_og}</div>
                        </div>
                      )}
                      {visite.audition && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-sm text-gray-500">Audition</div>
                          <div className="font-semibold">{visite.audition}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {visite.observations && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">Observations</div>
                      <div className="bg-gray-50 p-3 rounded">
                        {visite.observations}
                      </div>
                    </div>
                  )}

                  {visite.restrictions && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">Restrictions</div>
                      <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                        {visite.restrictions}
                      </div>
                    </div>
                  )}

                  {visite.numero_certificat && (
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="text-sm font-medium text-blue-900">
                            Certificat: {visite.numero_certificat}
                          </div>
                          <div className="text-xs text-blue-600">
                            {visite.envoye_employeur ? 'Envoyé à l\'employeur' : 'Non envoyé'}
                            {visite.date_envoi && ` le ${new Date(visite.date_envoi).toLocaleDateString('fr-FR')}`}
                          </div>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        <Eye className="h-3 w-3" />
                        Voir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DossierMedical;