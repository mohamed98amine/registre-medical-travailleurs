// Service de stockage local pour simuler le backend
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
  motifRejet?: string;
  commentaires?: string;
  dateCreation: string;
  dateModification?: string;
  employeurId: number;
  directeurRegionalId: number;
}

class LocalStorageService {
  private getDemandes(): DemandeAffiliation[] {
    const stored = localStorage.getItem('demandes_affiliation');
    return stored ? JSON.parse(stored) : [];
  }

  private saveDemandes(demandes: DemandeAffiliation[]) {
    localStorage.setItem('demandes_affiliation', JSON.stringify(demandes));
  }

  private getNextId(): number {
    const demandes = this.getDemandes();
    return demandes.length > 0 ? Math.max(...demandes.map(d => d.id)) + 1 : 1;
  }

  // Créer une nouvelle demande
  createDemande(demandeData: Omit<DemandeAffiliation, 'id' | 'dateCreation' | 'dateModification' | 'statut'>): DemandeAffiliation {
    const demandes = this.getDemandes();
    const nouvelleDemande: DemandeAffiliation = {
      ...demandeData,
      id: this.getNextId(),
      statut: 'NOUVELLE',
      dateCreation: new Date().toISOString(),
      directeurRegionalId: 1 // ID du directeur par défaut
    };
    
    demandes.push(nouvelleDemande);
    this.saveDemandes(demandes);
    return nouvelleDemande;
  }

  // Récupérer les demandes d'un employeur
  getDemandesByEmployeur(employeurId: number): DemandeAffiliation[] {
    const demandes = this.getDemandes();
    return demandes.filter(d => d.employeurId === employeurId);
  }

  // Récupérer toutes les demandes (pour le directeur)
  getAllDemandes(): DemandeAffiliation[] {
    return this.getDemandes();
  }

  // Mettre à jour le statut d'une demande
  updateDemandeStatus(id: number, statut: DemandeAffiliation['statut'], motifRejet?: string, commentaires?: string, zone?: string): DemandeAffiliation | null {
    const demandes = this.getDemandes();
    const index = demandes.findIndex(d => d.id === id);
    
    if (index === -1) return null;
    
    demandes[index].statut = statut;
    demandes[index].dateModification = new Date().toISOString();
    
    if (motifRejet) {
      demandes[index].motifRejet = motifRejet;
    }
    
    if (commentaires) {
      demandes[index].commentaires = commentaires;
    }

    // Ajouter la zone dans les commentaires si fournie
    if (zone) {
      const existingComments = demandes[index].commentaires || '';
      const zoneInfo = `ZONE_ASSIGNEE=${zone}`;
      demandes[index].commentaires = existingComments ? `${existingComments}; ${zoneInfo}` : zoneInfo;
    }
    
    this.saveDemandes(demandes);
    return demandes[index];
  }

  // Assigner une zone à une demande
  assignZoneToDemande(id: number, zone: string): DemandeAffiliation | null {
    const demandes = this.getDemandes();
    const index = demandes.findIndex(d => d.id === id);
    
    if (index === -1) return null;
    
    const existingComments = demandes[index].commentaires || '';
    const zoneInfo = `ZONE_ASSIGNEE=${zone}`;
    
    // Remplacer ou ajouter la zone
    if (existingComments.includes('ZONE_ASSIGNEE=')) {
      demandes[index].commentaires = existingComments.replace(/ZONE_ASSIGNEE=[^;]*/, zoneInfo);
    } else {
      demandes[index].commentaires = existingComments ? `${existingComments}; ${zoneInfo}` : zoneInfo;
      // Incrémenter le compteur d'assignations seulement si c'est une nouvelle assignation
      this.incrementAssignmentCounter();
    }
    
    demandes[index].dateModification = new Date().toISOString();
    this.saveDemandes(demandes);
    return demandes[index];
  }

  // Incrémenter le compteur d'assignations
  private incrementAssignmentCounter(): void {
    const currentCount = parseInt(localStorage.getItem('assignment_counter') || '0');
    localStorage.setItem('assignment_counter', (currentCount + 1).toString());
  }

  // Obtenir le compteur d'assignations
  getAssignmentCounter(): number {
    return parseInt(localStorage.getItem('assignment_counter') || '0');
  }

  // Extraire la zone assignée depuis les commentaires
  getAssignedZone(demande: DemandeAffiliation): string | null {
    if (!demande.commentaires) return null;
    const match = demande.commentaires.match(/ZONE_ASSIGNEE=([^;]+)/);
    return match ? match[1].trim() : null;
  }

  // Récupérer une demande par ID
  getDemandeById(id: number): DemandeAffiliation | null {
    const demandes = this.getDemandes();
    return demandes.find(d => d.id === id) || null;
  }

  // Obtenir les statistiques
  getStats() {
    const demandes = this.getDemandes();
    return {
      total: demandes.length,
      nouvelles: demandes.filter(d => d.statut === 'NOUVELLE').length,
      enCours: demandes.filter(d => d.statut === 'EN_COURS').length,
      validees: demandes.filter(d => d.statut === 'VALIDEE').length,
      rejetees: demandes.filter(d => d.statut === 'REJETEE').length
    };
  }
}

export const localStorageService = new LocalStorageService();







