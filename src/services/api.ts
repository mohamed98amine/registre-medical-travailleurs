import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  Entreprise, 
  EntrepriseFormData,
  Travailleur,
  VisiteMedicale,
  DashboardStats 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Une erreur est survenue';

    if (status === 403) {
      toast.error('Accès refusé. Permissions insuffisantes.');
    } else if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Session expirée. Veuillez vous reconnecter.');
      window.location.href = '/login';
    } else if (error.code === 'ERR_NETWORK') {
      toast.error('Erreur de connexion au serveur. Vérifiez que le serveur est démarré.');
    } else if (status === 500) {
      toast.error('Erreur interne du serveur. Veuillez réessayer plus tard.');
    } else {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);


export const entrepriseAPI = {
  getAll: (): Promise<{ data: Entreprise[] }> => 
    api.get('/entreprises'),
  
  getById: (id: number): Promise<{ data: Entreprise }> => 
    api.get(`/entreprises/${id}`),
  
  create: (data: EntrepriseFormData): Promise<{ data: Entreprise }> => 
    api.post('/entreprises', data),
  
  update: (id: number, data: Partial<EntrepriseFormData>): Promise<{ data: Entreprise }> => 
    api.put(`/entreprises/${id}`, data),
  
  delete: (id: number): Promise<any> => 
    api.delete(`/entreprises/${id}`),
};

export const travailleurAPI = {
  getAll: (): Promise<{ data: Travailleur[] }> => 
    api.get('/travailleurs'),
  
  getById: (id: number): Promise<{ data: Travailleur }> => 
    api.get(`/travailleurs/${id}`),
  
  getByEntreprise: (entrepriseId: number): Promise<{ data: Travailleur[] }> => 
    api.get(`/travailleurs/entreprise/${entrepriseId}`),
  
  create: (data: Omit<Travailleur, 'id'>): Promise<{ data: Travailleur }> => 
    api.post('/travailleurs', data),
  
  update: (id: number, data: Partial<Travailleur>): Promise<{ data: Travailleur }> => 
    api.put(`/travailleurs/${id}`, data),
  
  delete: (id: number): Promise<any> => 
    api.delete(`/travailleurs/${id}`),
};

export const visiteMedicaleAPI = {
  getAll: (): Promise<{ data: VisiteMedicale[] }> => 
    api.get('/visites-medicales'),
  
  getById: (id: number): Promise<{ data: VisiteMedicale }> => 
    api.get(`/visites-medicales/${id}`),
  
  getByMedecin: (medecinId: number): Promise<{ data: VisiteMedicale[] }> => 
    api.get(`/visites-medicales/medecin/${medecinId}`),
  
  getByEntreprise: (entrepriseId: number): Promise<{ data: VisiteMedicale[] }> => 
    api.get(`/visites-medicales/entreprise/${entrepriseId}`),
  
  getByDate: (date: string): Promise<{ data: VisiteMedicale[] }> => 
    api.get(`/visites-medicales/date/${date}`),
  
  create: (data: Omit<VisiteMedicale, 'id'>): Promise<{ data: VisiteMedicale }> => 
    api.post('/visites-medicales', data),
  
  update: (id: number, data: Partial<VisiteMedicale>): Promise<{ data: VisiteMedicale }> => 
    api.put(`/visites-medicales/${id}`, data),
  
  delete: (id: number): Promise<any> => 
    api.delete(`/visites-medicales/${id}`),
};

export const medecinAPI = {
  getAll: (): Promise<{ data: User[] }> => 
    api.get('/medecins'),
  
  getById: (id: number): Promise<{ data: User }> => 
    api.get(`/medecins/${id}`),
  
  create: (data: Omit<User, 'id'>): Promise<{ data: User }> => 
    api.post('/medecins', data),
  
  update: (id: number, data: Partial<User>): Promise<{ data: User }> => 
    api.put(`/medecins/${id}`, data),
  
  delete: (id: number): Promise<any> => 
    api.delete(`/medecins/${id}`),
};

export const dashboardAPI = {
  getStats: (): Promise<{ data: DashboardStats }> => 
    api.get('/dashboard/stats'),
  
  getStatsPeriodiques: (periode: string): Promise<{ data: any }> => 
    api.get(`/dashboard/stats/periodique?periode=${periode}`),
};

export const employerAPI = {
  overview: (): Promise<{ data: any }> => 
    api.get('/employer/overview'),
  
  workersCompact: (): Promise<{ data: any[] }> => 
    api.get('/employer/workers/compact'),
  
  upcomingVisits: (): Promise<{ data: any[] }> => 
    api.get('/employer/visits/upcoming'),
};

// API pour les contrats (Directeur Régional)
export const contratAPI = {
  getAll: (): Promise<{ data: any[] }> => 
    api.get('/contrats'),
  
  getById: (id: number): Promise<{ data: any }> => 
    api.get(`/contrats/${id}`),
  
  create: (data: any): Promise<{ data: any }> => 
    api.post('/contrats', data),
  
  amender: (id: number, data: any): Promise<{ data: any }> => 
    api.post(`/contrats/${id}/amender`, data),
};

// API pour l'envoi de contrats par email
export const contratMailAPI = {
  send: (data: { numeroContrat: string; raisonSociale: string; email: string; zone: string; montant: number }): Promise<{ data: any }> =>
    api.post('/contrats/send', data),
  generate: (data: { numeroContrat: string; raisonSociale: string; email: string; zone: string; montant: number }): Promise<{ data: any }> =>
    api.post('/contrats/generate', data),
};

// API pour les demandes d'affiliation - UTILISATION DU BACKEND
export const demandeAffiliationAPI = {
  // Pour les employeurs
  create: (data: any): Promise<{ data: any }> => 
    api.post('/demandes-affiliation', data),
  
  getMy: (): Promise<{ data: any[] }> => 
    api.get('/demandes-affiliation/mes-demandes'),
  
  getById: (id: number): Promise<{ data: any }> => 
    api.get(`/demandes-affiliation/${id}`),
  
  // Pour les directeurs régionaux
  getAll: (): Promise<{ data: any[] }> => 
    api.get('/demandes-affiliation'),
  
  approve: (id: number, data?: any): Promise<{ data: any }> => 
    api.post(`/demandes-affiliation/${id}/valider`, data),
  
  reject: (id: number, data: { motifRejet: string; commentaires?: string }): Promise<{ data: any }> => 
    api.post(`/demandes-affiliation/${id}/rejeter`, data),
  
  // Méthodes valider et rejeter pour compatibilité
  valider: (id: number, data: any): Promise<{ data: any }> => 
    api.post(`/demandes-affiliation/${id}/valider`, data),
  
  rejeter: (id: number, data: any): Promise<{ data: any }> => 
    api.post(`/demandes-affiliation/${id}/rejeter`, data),

  // Assigner une zone à une demande
  assignZone: (id: number, zone: string): Promise<{ data: any }> => 
    api.post(`/demandes-affiliation/${id}/assign-zone`, { zone }),
  
  update: (id: number, data: any): Promise<{ data: any }> => 
    api.put(`/demandes-affiliation/${id}`, data),
};

// Ajouter la méthode get à authAPI pour la compatibilité
export const authAPI = {
  login: (data: LoginRequest): Promise<{ data: AuthResponse }> => 
    api.post('/auth/login', data),
  
  register: (data: RegisterRequest): Promise<{ data: AuthResponse }> => 
    api.post('/auth/register', data),
  
  logout: (): Promise<any> => 
    api.post('/auth/logout'),
  
  me: (): Promise<{ data: User }> => 
    api.get('/auth/profile'),
  
  // Ajouter une méthode get générique
  get: (url: string): Promise<{ data: any }> => 
    api.get(url),
  
  post: (url: string, data?: any): Promise<{ data: any }> => 
    api.post(url, data),
  
  put: (url: string, data?: any): Promise<{ data: any }> => 
    api.put(url, data),
  
  delete: (url: string): Promise<{ data: any }> => 
    api.delete(url),
};

export default api;