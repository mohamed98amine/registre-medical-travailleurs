import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import CertificatMedicalForm from '../components/CertificatMedicalForm';

interface Consultation {
  id: number;
  type_visite: string;
  specialite: string;
  date_souhaitee: string;
  motif: string;
  travailleur_ids: string;
  statut: string;
  created_at: string;
  medecin_nom: string;
  medecin_prenom: string;
}

const MesConsultations: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCertificatForm, setShowCertificatForm] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      // Utiliser l'email du médecin sélectionné dans la demande
      // Pour test, utiliser l'email d'un médecin existant
      const medecinEmail = 'ouedrao666gomohamedamine98@gmail.com'; // Email du médecin ID 12
      const response = await fetch(`http://localhost:8080/api/consultations/medecin/${encodeURIComponent(medecinEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setConsultations(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (id: number, nouveauStatut: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/consultations/${id}/statut`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ statut: nouveauStatut })
      });

      if (response.ok) {
        fetchConsultations();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const ouvrirFormulaireCertificat = (consultation: any) => {
    setSelectedConsultation(consultation);
    setShowCertificatForm(true);
  };

  const genererCertificat = async (certificatData: any) => {
    try {
      // Générer un certificat pour chaque travailleur sélectionné
      for (const travailleur of certificatData.travailleursSelectionnes) {
        const dataForTravailleur = {
          ...certificatData,
          travailleurNom: travailleur.nom,
          travailleurPrenom: travailleur.prenom,
          entrepriseNom: 'Entreprise Test'
        };
        
        const response = await fetch(`http://localhost:8080/api/consultations/generer-certificat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataForTravailleur)
        });

        if (!response.ok) {
          const responseData = await response.json();
          alert('Erreur pour ' + travailleur.nom + ': ' + (responseData.error || 'Erreur inconnue'));
          return;
        }
      }
      
      alert(`${certificatData.travailleursSelectionnes.length} certificat(s) généré(s) avec succès!`);
      setShowCertificatForm(false);
      setSelectedConsultation(null);
      fetchConsultations();
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la génération du certificat');
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTEE': return 'bg-green-100 text-green-800';
      case 'REFUSEE': return 'bg-red-100 text-red-800';
      case 'TERMINEE': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'EN_ATTENTE': return <AlertCircle className="w-4 h-4" />;
      case 'ACCEPTEE': return <CheckCircle className="w-4 h-4" />;
      case 'REFUSEE': return <XCircle className="w-4 h-4" />;
      case 'TERMINEE': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement des consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Consultations</h1>
              <p className="text-gray-600">Gestion des demandes de visites médicales</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              {consultations.filter(c => c.statut === 'EN_ATTENTE').length} En attente
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              {consultations.filter(c => c.statut === 'ACCEPTEE').length} Acceptées
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              {consultations.filter(c => c.statut === 'TERMINEE').length} Terminées
            </span>
          </div>
        </div>

        {consultations.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune consultation</h3>
            <p className="text-gray-500 max-w-md mx-auto">Vous n'avez pas encore de demandes de visite assignées. Les nouvelles demandes apparaîtront ici.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {consultations.map((consultation) => (
              <div key={consultation.id} className="card hover:shadow-lg transition-all duration-200 animate-slide-in">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-sm">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {consultation.type_visite}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Spécialité: <span className="font-medium">{consultation.specialite}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`badge ${getStatutColor(consultation.statut)} flex items-center gap-2 px-3 py-2`}>
                    {getStatutIcon(consultation.statut)}
                    <span className="font-medium">{consultation.statut.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date souhaitée</p>
                      <p className="font-medium text-gray-900">{new Date(consultation.date_souhaitee).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Demandé le</p>
                      <p className="font-medium text-gray-900">{new Date(consultation.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Motif de la consultation
                  </h4>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{consultation.motif}</p>
                  </div>
                </div>

                {consultation.travailleur_ids && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Travailleurs concernés:</h4>
                    <p className="text-sm text-gray-600">
                      {consultation.travailleur_ids.split(',').length} travailleur(s) sélectionné(s)
                    </p>
                  </div>
                )}

                {consultation.statut === 'EN_ATTENTE' && (
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => updateStatut(consultation.id, 'ACCEPTEE')}
                      className="btn btn-success gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Accepter la demande</span>
                    </button>
                    <button
                      onClick={() => updateStatut(consultation.id, 'REFUSEE')}
                      className="btn btn-danger gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Refuser</span>
                    </button>
                  </div>
                )}

                {consultation.statut === 'ACCEPTEE' && (
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-100">
                    <button
                      onClick={() => updateStatut(consultation.id, 'TERMINEE')}
                      className="btn btn-primary gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Marquer comme terminée</span>
                    </button>
                    <button
                      onClick={() => ouvrirFormulaireCertificat(consultation)}
                      className="btn btn-success gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Générer certificat</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showCertificatForm && selectedConsultation && (
        <CertificatMedicalForm
          consultation={selectedConsultation}
          onClose={() => {
            setShowCertificatForm(false);
            setSelectedConsultation(null);
          }}
          onSubmit={genererCertificat}
        />
      )}
    </div>
  );
};

export default MesConsultations;