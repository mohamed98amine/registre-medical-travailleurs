import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Calendar, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const DisponibiliteMedecin: React.FC = () => {
  const { user } = useAuth();
  const [disponibilites, setDisponibilites] = useState<any[]>([]);
  const [indisponibilites, setIndisponibilites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [nouvelleDisponibilite, setNouvelleDisponibilite] = useState({
    jourSemaine: 'LUNDI',
    heureDebut: '08:00',
    heureFin: '17:00'
  });

  const [nouvelleIndisponibilite, setNouvelleIndisponibilite] = useState({
    dateDebut: '',
    dateFin: '',
    motif: ''
  });

  const joursMap = {
    'LUNDI': 'Lundi',
    'MARDI': 'Mardi', 
    'MERCREDI': 'Mercredi',
    'JEUDI': 'Jeudi',
    'VENDREDI': 'Vendredi',
    'SAMEDI': 'Samedi',
    'DIMANCHE': 'Dimanche'
  };

  useEffect(() => {
    if (user?.id) {
      loadDisponibilites();
    }
  }, [user]);

  const loadDisponibilites = async () => {
    try {
      console.log('Chargement des disponibilités pour user:', user?.id);
      const response = await fetch(`/api/medecin/disponibilite/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Données reçues:', data);
        setDisponibilites(data.disponibilites || []);
        setIndisponibilites(data.indisponibilites || []);
      } else {
        console.error('Erreur response:', response.status);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const ajouterDisponibilite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/disponibilites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           ...nouvelleDisponibilite
         })
      });

      if (response.ok) {
        toast.success('Disponibilité ajoutée');
        setShowForm(false);
        setNouvelleDisponibilite({
          jourSemaine: 'LUNDI',
          heureDebut: '08:00',
          heureFin: '17:00'
        });
        loadDisponibilites();
      } else {
        toast.error('Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  const ajouterIndisponibilite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/indisponibilites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           ...nouvelleIndisponibilite
         })
      });

      if (response.ok) {
        toast.success('Indisponibilité ajoutée');
        setNouvelleIndisponibilite({
          dateDebut: '',
          dateFin: '',
          motif: ''
        });
        loadDisponibilites();
      } else {
        toast.error('Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion');
    }
  };

  const partagerDisponibilite = async () => {
    if (sending) return;
    
    const emailChefZone = prompt('Entrez l\'email du chef de zone:');
    
    if (!emailChefZone || emailChefZone.trim() === '') {
      toast.error('Email requis pour envoyer l\'emploi du temps');
      return;
    }

    // Vérifier format email basique
    if (!emailChefZone.includes('@')) {
      toast.error('Format d\'email invalide');
      return;
    }

    setSending(true);
    
    try {
      console.log('Envoi emploi du temps à:', emailChefZone);
      console.log('Disponibilités:', disponibilites);
      console.log('Indisponibilités:', indisponibilites);
      
      const response = await fetch('/api/envoyer-emploi-temps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomMedecin: user?.name || 'Dr. Médecin',
          emailMedecin: user?.email || 'medecin@example.com',
          emailChefZone: emailChefZone.trim(),
          disponibilites: JSON.stringify(disponibilites),
          indisponibilites: JSON.stringify(indisponibilites)
        })
      });

      console.log('Réponse status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Résultat:', result);
        toast.success(`Emploi du temps envoyé à ${emailChefZone}`);
        window.open('/chef-zone/medecins-disponibles', '_blank');
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
        console.error('Erreur réponse:', errorData);
        toast.error(`Erreur: ${errorData.error || 'Erreur lors de l\'envoi'}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur de connexion au serveur');
    } finally {
      setSending(false);
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Disponibilités</h1>
              <p className="text-gray-600">Gérez vos créneaux horaires</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Ajouter un créneau
          </button>
        </div>

        {/* Formulaire d'ajout */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Nouveau créneau</h2>
            <form onSubmit={ajouterDisponibilite} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jour de la semaine
                </label>
                <select
                  value={nouvelleDisponibilite.jourSemaine}
                  onChange={(e) => setNouvelleDisponibilite({...nouvelleDisponibilite, jourSemaine: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(joursMap).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de début
                </label>
                <input
                  type="time"
                  value={nouvelleDisponibilite.heureDebut}
                  onChange={(e) => setNouvelleDisponibilite({...nouvelleDisponibilite, heureDebut: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de fin
                </label>
                <input
                  type="time"
                  value={nouvelleDisponibilite.heureFin}
                  onChange={(e) => setNouvelleDisponibilite({...nouvelleDisponibilite, heureFin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-3 flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des disponibilités */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Créneaux réguliers</h2>
          </div>
          <div className="p-6">
            {disponibilites.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Aucun créneau défini. Ajoutez vos disponibilités pour que les chefs de zone puissent programmer des visites.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {disponibilites.map((dispo) => (
                  <div key={dispo.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{joursMap[dispo.jour_semaine as keyof typeof joursMap]}</div>
                      <div className="text-sm text-gray-500">
                        {dispo.heure_debut} - {dispo.heure_fin}
                      </div>
                    </div>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bouton partager */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Partager mon emploi du temps</h3>
            <p className="text-gray-600 text-sm mb-4">
              Envoyez votre emploi du temps au chef de zone pour qu'il puisse consulter vos disponibilités.
            </p>
          </div>
          <button
            onClick={partagerDisponibilite}
            disabled={disponibilites.length === 0 || sending}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-medium ${
              disponibilites.length === 0 || sending
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Share2 className="h-5 w-5" />
            )}
            {sending ? 'Envoi en cours...' : 'Envoyer mon emploi du temps au chef de zone'}
          </button>
          {disponibilites.length === 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Ajoutez au moins un créneau de disponibilité avant d'envoyer votre emploi du temps.
            </p>
          )}
          {sending && (
            <p className="text-sm text-blue-600 mt-2">
              Envoi en cours, veuillez patienter...
            </p>
          )}
        </div>

        {/* Emploi du temps */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Mon emploi du temps</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(jour => (
                <div key={jour} className="text-center font-medium text-gray-700 p-2 bg-gray-50 rounded">
                  {jour}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'].map(jour => {
                const dispoJour = disponibilites.filter(d => d.jour_semaine === jour);
                return (
                  <div key={jour} className="min-h-[100px] border rounded p-2">
                    {dispoJour.length === 0 ? (
                      <div className="text-xs text-gray-400 p-1">Libre</div>
                    ) : (
                      dispoJour.map(dispo => (
                        <div key={dispo.id} className="bg-green-100 text-green-800 text-xs p-1 rounded mb-1">
                          {dispo.heure_debut} - {dispo.heure_fin}
                        </div>
                      ))
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Indisponibilités */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Indisponibilités ponctuelles</h2>
          </div>
          <div className="p-6">
            {indisponibilites.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-3">Indisponibilités enregistrées</h3>
                <div className="space-y-2">
                  {indisponibilites.map(indispo => (
                    <div key={indispo.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                      <div>
                        <div className="font-medium text-red-800">{indispo.motif}</div>
                        <div className="text-sm text-red-600">
                          Du {indispo.date_debut ? new Date(indispo.date_debut).toLocaleString() : 'Date non définie'} au {indispo.date_fin ? new Date(indispo.date_fin).toLocaleString() : 'Date non définie'}
                        </div>
                      </div>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <form onSubmit={ajouterIndisponibilite} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                </label>
                <input
                  type="datetime-local"
                  value={nouvelleIndisponibilite.dateDebut}
                  onChange={(e) => setNouvelleIndisponibilite({...nouvelleIndisponibilite, dateDebut: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="datetime-local"
                  value={nouvelleIndisponibilite.dateFin}
                  onChange={(e) => setNouvelleIndisponibilite({...nouvelleIndisponibilite, dateFin: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif
                </label>
                <input
                  type="text"
                  placeholder="Congés, formation..."
                  value={nouvelleIndisponibilite.motif}
                  onChange={(e) => setNouvelleIndisponibilite({...nouvelleIndisponibilite, motif: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Calendar className="h-4 w-4" />
                  Ajouter une indisponibilité
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisponibiliteMedecin;