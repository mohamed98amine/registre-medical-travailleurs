// Service de synchronisation des données pour persistance permanente
export class DataSyncService {
  private static instance: DataSyncService;

  public static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  // Synchroniser les médecins
  public syncMedecins(nouveauxMedecins: any[]) {
    const existants = this.getMedecins();
    const merged = this.mergeData(existants, nouveauxMedecins, 'id');
    localStorage.setItem('medecins', JSON.stringify(merged));
    return merged;
  }

  // Synchroniser les entreprises
  public syncEntreprises(nouvellesEntreprises: any[]) {
    const existantes = this.getEntreprises();
    const merged = this.mergeData(existantes, nouvellesEntreprises, 'id');
    localStorage.setItem('entreprises', JSON.stringify(merged));
    return merged;
  }

  // Synchroniser les employeurs
  public syncEmployeurs(nouveauxEmployeurs: any[]) {
    const existants = this.getEmployeurs();
    const merged = this.mergeData(existants, nouveauxEmployeurs, 'id');
    localStorage.setItem('employeurs', JSON.stringify(merged));
    return merged;
  }

  // Ajouter un nouveau médecin
  public addMedecin(medecin: any) {
    const medecins = this.getMedecins();
    const nouveauMedecin = { ...medecin, id: medecin.id || Date.now() };
    medecins.push(nouveauMedecin);
    localStorage.setItem('medecins', JSON.stringify(medecins));
    return nouveauMedecin;
  }

  // Ajouter une nouvelle entreprise
  public addEntreprise(entreprise: any) {
    const entreprises = this.getEntreprises();
    const nouvelleEntreprise = { ...entreprise, id: entreprise.id || Date.now() };
    entreprises.push(nouvelleEntreprise);
    localStorage.setItem('entreprises', JSON.stringify(entreprises));
    return nouvelleEntreprise;
  }

  // Ajouter un nouvel employeur
  public addEmployeur(employeur: any) {
    const employeurs = this.getEmployeurs();
    const nouvelEmployeur = { ...employeur, id: employeur.id || Date.now() };
    employeurs.push(nouvelEmployeur);
    localStorage.setItem('employeurs', JSON.stringify(employeurs));
    return nouvelEmployeur;
  }

  // Récupérer les médecins
  public getMedecins(): any[] {
    try {
      return JSON.parse(localStorage.getItem('medecins') || '[]');
    } catch {
      return [];
    }
  }

  // Récupérer les entreprises
  public getEntreprises(): any[] {
    try {
      return JSON.parse(localStorage.getItem('entreprises') || '[]');
    } catch {
      return [];
    }
  }

  // Récupérer les employeurs
  public getEmployeurs(): any[] {
    try {
      return JSON.parse(localStorage.getItem('employeurs') || '[]');
    } catch {
      return [];
    }
  }

  // Fusionner les données existantes avec les nouvelles
  private mergeData(existants: any[], nouveaux: any[], keyField: string): any[] {
    const merged = [...existants];
    
    nouveaux.forEach(nouveau => {
      const existantIndex = merged.findIndex(item => item[keyField] === nouveau[keyField]);
      if (existantIndex >= 0) {
        // Mettre à jour l'existant
        merged[existantIndex] = { ...merged[existantIndex], ...nouveau };
      } else {
        // Ajouter le nouveau
        merged.push(nouveau);
      }
    });

    return merged;
  }

  // Nettoyer les données obsolètes (optionnel)
  public clearCache() {
    localStorage.removeItem('medecins');
    localStorage.removeItem('entreprises');
    localStorage.removeItem('employeurs');
  }

  // Exporter toutes les données pour sauvegarde
  public exportData() {
    return {
      medecins: this.getMedecins(),
      entreprises: this.getEntreprises(),
      employeurs: this.getEmployeurs(),
      timestamp: new Date().toISOString()
    };
  }

  // Importer des données depuis une sauvegarde
  public importData(data: any) {
    if (data.medecins) {
      localStorage.setItem('medecins', JSON.stringify(data.medecins));
    }
    if (data.entreprises) {
      localStorage.setItem('entreprises', JSON.stringify(data.entreprises));
    }
    if (data.employeurs) {
      localStorage.setItem('employeurs', JSON.stringify(data.employeurs));
    }
  }
}

export default DataSyncService;