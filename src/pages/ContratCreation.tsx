import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Building2, 
  Calculator, 
  Eye, 
  Save,
  ArrowLeft,
  Calendar,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DemandeAffiliation {
  id: number;
  raisonSociale: string;
  numeroRccm: string;
  secteurActivite: string;
  effectif: number;
  adresse: string;
  representantLegal: string;
  email: string;
  telephone: string;
  contactDrh: string;
  chiffreAffaireAnnuel?: number;
}

interface ContratFormData {
  demandeId: number;
  typeContrat: string;
  dateSignature: string;
  dateDebut: string;
  dateFin: string;
  zoneMedicale: string;
  region: string;
  tarifAnnuel?: number;
  tarifMensuel?: number;
}

const TYPES_CONTRAT = [
  { value: 'STANDARD', label: 'Contrat Standard', tarif: 15000, description: 'Entreprises générales' },
  { value: 'INDUSTRIE_PETROLIERE', label: 'Contrat Industrie Pétrolière', tarif: 45000, description: 'Secteur pétrolier et énergétique' },
  { value: 'CONSTRUCTION', label: 'Contrat Construction', tarif: 35000, description: 'BTP et construction' },
  { value: 'COMMERCE', label: 'Contrat Commerce', tarif: 20000, description: 'Commerce et distribution' },
  { value: 'SPECIAL', label: 'Contrat Spécial', tarif: 0, description: 'Tarif négocié' }
];

const ZONES_MEDICALES = [
  'Ouagadougou Nord',
  'Ouagadougou Sud',
  'Ouagadougou Centre',
  'Bobo-Dioulasso',
  'Koudougou',
  'Ouahigouya',
  'Kaya',
  'Banfora',
  'Dédougou',
  'Fada N\'Gourma'
];

const REGIONS = [
  'Centre',
  'Hauts-Bassins',
  'Centre-Ouest',
  'Nord',
  'Centre-Nord',
  'Plateau-Central',
  'Cascades',
  'Boucle du Mouhoun',
  'Est',
  'Sahel',
  'Sud-Ouest'
];

const ContratCreation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [demande, setDemande] = useState<DemandeAffiliation | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ContratFormData>({
    demandeId: 0,
    typeContrat: '',
    dateSignature: new Date().toISOString().split('T')[0],
    dateDebut: '',
    dateFin: '',
    zoneMedicale: '',
    region: '',
    tarifAnnuel: 0,
    tarifMensuel: 0
  });

  useEffect(() => {
    const demandeId = new URLSearchParams(location.search).get('demandeId');
    if (demandeId) {
      fetchDemande(parseInt(demandeId));
      setFormData(prev => ({ ...prev, demandeId: parseInt(demandeId) }));
    } else {
      navigate('/demandes-affiliation');
    }
  }, [location.search, navigate]);

  const fetchDemande = async (demandeId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/demandes-affiliation/${demandeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDemande(data);
        
        // Définir la date de début comme aujourd'hui et la fin dans un an
        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        
        setFormData(prev => ({
          ...prev,
          dateDebut: today.toISOString().split('T')[0],
          dateFin: nextYear.toISOString().split('T')[0]
        }));
      } else {
        toast.error('Erreur lors du chargement de la demande');
        navigate('/demandes-affiliation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement de la demande');
      navigate('/demandes-affiliation');
    } finally {
      setLoading(false);
    }
  };

  const handleTypeContratChange = (typeContrat: string) => {
    const type = TYPES_CONTRAT.find(t => t.value === typeContrat);
    setFormData(prev => ({
      ...prev,
      typeContrat,
      tarifAnnuel: type && demande ? type.tarif * demande.effectif : 0,
      tarifMensuel: type && demande ? (type.tarif * demande.effectif) / 12 : 0
    }));
  };

  const calculateTarifs = () => {
    if (!demande) return { tarifAnnuel: 0, tarifMensuel: 0 };
    
    const type = TYPES_CONTRAT.find(t => t.value === formData.typeContrat);
    if (type && type.tarif > 0) {
      const tarifAnnuel = type.tarif * demande.effectif;
      const tarifMensuel = tarifAnnuel / 12;
      return { tarifAnnuel, tarifMensuel };
    }
    
    return { tarifAnnuel: formData.tarifAnnuel || 0, tarifMensuel: formData.tarifMensuel || 0 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!demande) {
      toast.error('Données de la demande non disponibles');
      return;
    }

    if (!formData.typeContrat || !formData.zoneMedicale || !formData.region) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      // 1. Créer le contrat dans la base de données
      const token = localStorage.getItem('token');

      // Préparer le payload avec les données minimales requises
      const contratPayload = {
        // Données de l'entreprise depuis la demande
        raisonSociale: demande.raisonSociale,
        numeroRccm: demande.numeroRccm,
        secteurActivite: demande.secteurActivite,
        effectif: demande.effectif,
        adresse: demande.adresse,
        representantLegal: demande.representantLegal,
        email: demande.email,
        telephone: demande.telephone,
        contactDrh: demande.contactDrh,

        // Données du contrat
        demandeAffiliationId: demande.id,
        typeContrat: formData.typeContrat,
        dateDebut: formData.dateDebut,
        zoneMedicale: formData.zoneMedicale,

        // Calcul de la durée en mois
        duree: 12, // Durée fixe de 12 mois pour simplifier

        // Tarif personnalisé si contrat spécial
        tarifPersonnalise: formData.typeContrat === 'SPECIAL' ? formData.tarifAnnuel : null
      };


      const contratResponse = await fetch('http://localhost:8080/api/contrats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contratPayload)
      });

      if (!contratResponse.ok) {
        toast.error('Erreur lors de la création du contrat');
        return;
      }

      const contrat = await contratResponse.json();

      // Stocker les informations du contrat dans localStorage pour l'employeur
      const contratData = {
        numeroContrat: contrat.numeroContrat,
        raisonSociale: demande.raisonSociale,
        email: demande.email,
        zone: formData.zoneMedicale,
        montant: formData.tarifAnnuel || tarifAnnuel,
        dateGeneration: new Date().toISOString(),
        contratId: contrat.id,
        demandeId: demande.id
      };

      localStorage.setItem('contrat_pdf_' + demande.id, JSON.stringify(contratData));

      toast.success('Contrat créé avec succès !');
      navigate('/demandes-affiliation');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du contrat');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const { tarifAnnuel, tarifMensuel } = calculateTarifs();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de la demande...</p>
        </div>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Demande non trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">La demande d'affiliation n'existe pas ou vous n'y avez pas accès.</p>
          <button
            onClick={() => navigate('/demandes-affiliation')}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux demandes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Création de Contrat</h1>
              <p className="text-gray-600">Génération automatique du contrat d'affiliation</p>
            </div>
            <button
              onClick={() => navigate('/demandes-affiliation')}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Informations du Contrat</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type de contrat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de Contrat *
                </label>
                <select
                  value={formData.typeContrat}
                  onChange={(e) => handleTypeContratChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionner un type</option>
                  {TYPES_CONTRAT.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.tarif > 0 ? `${formatCurrency(type.tarif)}/employé/an` : 'Tarif négocié'}
                    </option>
                  ))}
                </select>
                {formData.typeContrat && (
                  <p className="mt-1 text-sm text-gray-600">
                    {TYPES_CONTRAT.find(t => t.value === formData.typeContrat)?.description}
                  </p>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de signature *
                  </label>
                  <input
                    type="date"
                    value={formData.dateSignature}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateSignature: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de début
                  </label>
                  <input
                    type="date"
                    value={formData.dateDebut}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateDebut: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    value={formData.dateFin}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateFin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Zone médicale et région */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone médicale *
                  </label>
                  <select
                    value={formData.zoneMedicale}
                    onChange={(e) => setFormData(prev => ({ ...prev, zoneMedicale: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner une zone</option>
                    {ZONES_MEDICALES.map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Région *
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner une région</option>
                    {REGIONS.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tarif personnalisé (si contrat spécial) */}
              {formData.typeContrat === 'SPECIAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarif annuel personnalisé (FCFA)
                    </label>
                    <input
                      type="number"
                      value={formData.tarifAnnuel || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        tarifAnnuel: parseFloat(e.target.value) || 0,
                        tarifMensuel: (parseFloat(e.target.value) || 0) / 12
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Montant en FCFA"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarif mensuel calculé (FCFA)
                    </label>
                    <input
                      type="text"
                      value={formatCurrency(tarifMensuel)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      readOnly
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/demandes-affiliation')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Créer le contrat
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Aperçu du contrat */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Aperçu du Contrat</h2>
            
            {/* Informations entreprise */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Entreprise</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Raison sociale:</strong> {demande.raisonSociale}</p>
                <p><strong>RCCM:</strong> {demande.numeroRccm}</p>
                <p><strong>Secteur:</strong> {demande.secteurActivite}</p>
                <p><strong>Effectif:</strong> {demande.effectif} employés</p>
                <p><strong>Représentant légal:</strong> {demande.representantLegal}</p>
                <p><strong>Contact DRH:</strong> {demande.contactDrh}</p>
              </div>
            </div>

            {/* Calcul des tarifs */}
            {formData.typeContrat && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2 flex items-center">
                  <Calculator className="w-4 h-4 mr-2" />
                  Calcul automatique
                </h3>
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Effectif:</strong> {demande.effectif} employés</p>
                  {formData.typeContrat !== 'SPECIAL' && (
                    <p><strong>Tarif unitaire:</strong> {formatCurrency(TYPES_CONTRAT.find(t => t.value === formData.typeContrat)?.tarif || 0)}/employé/an</p>
                  )}
                  <p><strong>Cotisation annuelle:</strong> <span className="font-bold text-green-900">{formatCurrency(tarifAnnuel)}</span></p>
                  <p><strong>Cotisation mensuelle:</strong> <span className="font-bold text-green-900">{formatCurrency(tarifMensuel)}</span></p>
                </div>
              </div>
            )}

            {/* Informations contrat */}
            {formData.typeContrat && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Détails du contrat</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Type:</strong> {TYPES_CONTRAT.find(t => t.value === formData.typeContrat)?.label}</p>
                  <p><strong>Zone médicale:</strong> {formData.zoneMedicale || 'Non définie'}</p>
                  <p><strong>Région:</strong> {formData.region || 'Non définie'}</p>
                  <p><strong>Date de signature:</strong> {formData.dateSignature ? new Date(formData.dateSignature).toLocaleDateString('fr-FR') : 'Non définie'}</p>
                  <p><strong>Durée:</strong> {formData.dateDebut && formData.dateFin ? 
                    `${new Date(formData.dateDebut).toLocaleDateString('fr-FR')} - ${new Date(formData.dateFin).toLocaleDateString('fr-FR')}` : 
                    'Non définie'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContratCreation;
