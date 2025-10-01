export interface User {
  id: number;
  email: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  role: 'EMPLOYEUR' | 'MEDECIN' | 'DIRECTEUR_REGIONAL' | 'ADMIN';
  specialite?: string;
  createdAt: string;
}

export interface Entreprise {
  id?: number;
  raisonSociale: string;
  secteurActivite: string;
  effectif: number;
  adresse: string;
  telephone: string;
  email: string;
  zoneAffectation: string;
  employeur: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface EntrepriseFormData {
  nom: string;
  secteurActivite: string;
  effectif: number;
  email: string;
  telephone: string;
  adresse: string;
  ville?: string;
  codePostal?: string;
}

export interface Travailleur {
  id: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  poste?: string;
  telephone?: string;
  email?: string;
  adresse: string;
  ville: string;
  codePostal: string;
  entreprise?: Entreprise;
  createdAt?: string;
  updatedAt?: string;
}

export interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  specialite: string;
  telephone: string;
  email: string;
  adresse: string;
  ville: string;
  codePostal: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VisiteMedicale {
  id: number;
  type: string;
  date: string;
  examens: string[];
  aptitude?: string;
  observations?: string;
  restrictions?: string;
  statut: string;
  travailleur?: Travailleur;
  medecin?: Medecin;
  entreprise?: Entreprise;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  email: string;
  password: string;
  role: string;
  prenom?: string;
  telephone?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalTravailleurs?: number;
  totalVisites?: number;
  visitesEnAttente?: number;
  tauxAptitude?: number;
  entreprisesAffiliees?: number;
  visitesAujourdhui?: number;
}

// Types pour l'interface Directeur Régional
export interface DemandeAffiliation {
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
  statut: 'NOUVELLE' | 'EN_COURS' | 'VALIDEE' | 'REJETEE';
  dateCreation: string;
  dateModification?: string;
  motifRejet?: string;
  commentaires?: string;
  directeurRegional?: User;
}

export interface Contrat {
  id: number;
  numeroContrat: string;
  dateSignature: string;
  dateDebut?: string;
  dateFin?: string;
  typeContrat: 'STANDARD' | 'INDUSTRIE_PETROLIERE' | 'CONSTRUCTION' | 'COMMERCE' | 'SPECIAL';
  tarifAnnuel: number;
  tarifMensuel: number;
  zoneMedicale: string;
  region: string;
  version: number;
  actif: boolean;
  motifAmendement?: string;
  dateCreation: string;
  dateModification?: string;
  demandeAffiliation: DemandeAffiliation;
  directeurRegional: User;
  amendements?: AmendementContrat[];
}

export interface AmendementContrat {
  id: number;
  motif: string;
  changements?: string;
  nouveauEffectif?: number;
  nouveauTarifAnnuel?: number;
  nouveauTarifMensuel?: number;
  dateEffet: string;
  dateCreation: string;
  contrat: Contrat;
  directeurRegional: User;
}