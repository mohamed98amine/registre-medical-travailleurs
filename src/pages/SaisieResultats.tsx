import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SaisieResultats: React.FC = () => {
  const { visiteId } = useParams<{ visiteId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [visite, setVisite] = useState<any>(null);
  
  const [resultats, setResultats] = useState({
    tensionArterielle: '',
    frequenceCardiaque: '',
    poids: '',
    taille: '',
    visionOD: '',
    visionOG: '',
    audition: '',
    observations: '',
    verdict: 'APTE',
    restrictions: ''
  });

  useEffect(() => {
    loadVisite();
  }, [visiteId]);

  const loadVisite = async () => {
    try {
      const response = await fetch(`/api/visites-jdbc/${visiteId}`);
      if (response.ok) {
        const data = await response.json();
        setVisite(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/medecin/resultats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visiteId: parseInt(visiteId!),
          ...resultats
        })
      });

      if (response.ok) {
        toast.success('Résultats enregistrés avec succès');
        navigate('/visites-medicales');
      } else {
        toast.error('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const genererCertificat = async () => {
    try {
      const response = await fetch(`/api/medecin/certificat/${visiteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Certificat généré et envoyé à l\'employeur');
      } else {
        toast.error('Erreur lors de la génération du certificat');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/visites-medicales')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
            Retour
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Saisie des Résultats</h1>
        </div>

        {visite && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Informations de la visite</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Employeur:</strong> {visite.employeur?.nom}</div>
              <div><strong>Type:</strong> {visite.type}</div>
              <div><strong>Date:</strong> {visite.date}</div>
              <div><strong>Heure:</strong> {visite.heure}</div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mesures vitales */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tension artérielle
              </label>
              <input
                type="text"
                placeholder="ex: 120/80"
                value={resultats.tensionArterielle}
                onChange={(e) => setResultats({...resultats, tensionArterielle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence cardiaque (bpm)
              </label>
              <input
                type="number"
                value={resultats.frequenceCardiaque}
                onChange={(e) => setResultats({...resultats, frequenceCardiaque: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={resultats.poids}
                onChange={(e) => setResultats({...resultats, poids: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille (cm)
              </label>
              <input
                type="number"
                value={resultats.taille}
                onChange={(e) => setResultats({...resultats, taille: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Vision */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vision OD (œil droit)
              </label>
              <input
                type="text"
                placeholder="ex: 10/10"
                value={resultats.visionOD}
                onChange={(e) => setResultats({...resultats, visionOD: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vision OG (œil gauche)
              </label>
              <input
                type="text"
                placeholder="ex: 10/10"
                value={resultats.visionOG}
                onChange={(e) => setResultats({...resultats, visionOG: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Audition */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audition
              </label>
              <input
                type="text"
                placeholder="ex: Normale"
                value={resultats.audition}
                onChange={(e) => setResultats({...resultats, audition: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Observations */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observations
              </label>
              <textarea
                rows={4}
                value={resultats.observations}
                onChange={(e) => setResultats({...resultats, observations: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Verdict */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verdict *
              </label>
              <select
                value={resultats.verdict}
                onChange={(e) => setResultats({...resultats, verdict: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="APTE">Apte</option>
                <option value="INAPTE">Inapte</option>
                <option value="APTE_AVEC_RESTRICTIONS">Apte avec restrictions</option>
              </select>
            </div>

            {/* Restrictions */}
            {resultats.verdict === 'APTE_AVEC_RESTRICTIONS' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restrictions
                </label>
                <textarea
                  rows={3}
                  value={resultats.restrictions}
                  onChange={(e) => setResultats({...resultats, restrictions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Précisez les restrictions..."
                />
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Enregistrement...' : 'Enregistrer les résultats'}
            </button>

            <button
              type="button"
              onClick={genererCertificat}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <FileText className="h-4 w-4" />
              Générer le certificat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaisieResultats;