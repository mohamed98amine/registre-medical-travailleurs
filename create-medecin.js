// Script pour créer un médecin de test
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

async function createMedecin() {
  try {
    // Créer un médecin
    const medecinData = {
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@medecin.com',
      password: 'password123',
      role: 'MEDECIN',
      telephone: '0123456789',
      specialite: 'GENERALISTE'
    };

    console.log('Création du médecin...');
    const response = await axios.post(`${API_BASE_URL}/auth/register`, medecinData);
    
    console.log('Médecin créé avec succès:');
    console.log('Email:', medecinData.email);
    console.log('Mot de passe:', medecinData.password);
    console.log('Spécialité:', medecinData.specialite);
    console.log('Token:', response.data.token);
    
  } catch (error) {
    console.error('Erreur lors de la création du médecin:', error.response?.data || error.message);
  }
}

createMedecin();
