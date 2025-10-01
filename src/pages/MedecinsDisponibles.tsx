import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Stethoscope } from 'lucide-react';

const MedecinsDisponibles: React.FC = () => {
  const [medecins, setMedecins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMedecinsDisponibles();
  }, []);

  const loadMedecinsDisponibles = async () => {
    try {
      const response = await fetch('/api/chef-zone/medecins-disponibles');
      if (response.ok) {
        const data = await response.json();
        setMedecins(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
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
          <Calendar className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Médecins Disponibles</h1>
            <p className="text-gray-600">Consultez les disponibilités des médecins</p>
          </div>
        </div>

        {medecins.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune disponibilité partagée</h3>
            <p className="text-gray-500">Les médecins n'ont pas encore partagé leurs disponibilités.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {medecins.map((medecin) => {
              const disponibilites = JSON.parse(medecin.disponibilites || '[]');
              const indisponibilites = JSON.parse(medecin.indisponibilites || '[]');
              
              return (
                <div key={medecin.id} className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{medecin.nom_medecin}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="h-4 w-4" />
                          {medecin.email_medecin}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Disponibilités régulières
                      </h4>
                      {disponibilites.length === 0 ? (
                        <p className="text-gray-500 text-sm">Aucune disponibilité définie</p>
                      ) : (
                        <div className="grid grid-cols-7 gap-1 text-xs">
                          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((jour, index) => (
                            <div key={index} className="text-center font-medium text-gray-600 p-1">
                              {jour}
                            </div>
                          ))}
                          {['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'].map(jour => {
                            const dispoJour = disponibilites.filter((d: any) => d.jour_semaine === jour);
                            return (
                              <div key={jour} className="min-h-[60px] border rounded p-1">
                                {dispoJour.map((dispo: any, idx: number) => (
                                  <div key={idx} className="bg-green-100 text-green-800 text-xs p-1 rounded mb-1">
                                    {dispo.heure_debut?.substring(0,5)} - {dispo.heure_fin?.substring(0,5)}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {indisponibilites.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Indisponibilités
                        </h4>
                        <div className="space-y-2">
                          {indisponibilites.map((indispo: any, idx: number) => (
                            <div key={idx} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                              <div className="font-medium text-red-800">{indispo.motif}</div>
                              <div className="text-red-600">
                                Du {new Date(indispo.date_debut).toLocaleDateString()} au {new Date(indispo.date_fin).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 text-xs text-gray-500">
                      Partagé le {new Date(medecin.date_partage).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedecinsDisponibles;