# 🎯 Système de Programmation de Visites Médicales

## Objectif
Permettre la **PROGRAMMATION d'une visite** où l'on sélectionne une entreprise, un employeur et un médecin depuis des **listes déroulantes dynamiques**.

## ✅ Fonctionnalités Implémentées

### 🔄 Listes Déroulantes Dynamiques
- **Chargement automatique** des données depuis MySQL via API REST
- **Mise à jour en temps réel** des listes après chaque création
- **Recherche et filtrage** dans les listes
- **Validation** des champs obligatoires

### 🏢 Gestion des Entreprises
- ✅ **GET /api/entreprises** → Liste des entreprises
- ✅ **POST /api/entreprises** → Ajout d'une entreprise
- ✅ **Ajout rapide** depuis le formulaire de visite
- ✅ **Mise à jour automatique** de la liste déroulante

### 👥 Gestion des Employeurs  
- ✅ **GET /api/employeurs** → Liste des employeurs
- ✅ **POST /api/employeurs** → Ajout d'un employeur
- ✅ **Ajout rapide** depuis le formulaire de visite
- ✅ **Mise à jour automatique** de la liste déroulante

### 🩺 Gestion des Médecins
- ✅ **GET /api/medecins** → Liste des médecins
- ✅ **POST /api/medecins** → Ajout d'un médecin
- ✅ **Ajout rapide** depuis le formulaire de visite
- ✅ **Mise à jour automatique** de la liste déroulante

### 📅 Gestion des Visites
- ✅ **POST /api/visites** → Créer une visite complète
- ✅ **Sauvegarde en MySQL** avec toutes les données liées
- ✅ **Validation** des données avant sauvegarde
- ✅ **Messages de succès** avec détails de la visite

## 🚀 Démarrage du Système

### Option 1: Script Automatique (Recommandé)
```bash
# Windows
start-systeme-visites.bat

# PowerShell
.\start-systeme-visites.ps1
```

### Option 2: Démarrage Manuel
```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run

# Terminal 2 - Frontend  
npm run dev

# Terminal 3 - Test
# Ouvrir test-programmer-visite-complet.html
```

## 📱 Accès aux Applications

- **Frontend React**: http://localhost:5173
- **Backend API**: http://localhost:8080/api
- **Test Complet**: test-programmer-visite-complet.html

## 🎯 Comment Tester le Système

### 1. Accès à l'Application
1. Ouvrez http://localhost:5173
2. Connectez-vous en tant que **Chef de Zone**
3. Naviguez vers **"Programmer une Visite"**

### 2. Test des Listes Déroulantes
1. **Vérifiez** que les listes se chargent automatiquement
2. **Testez la recherche** dans chaque liste
3. **Vérifiez** que les données viennent de MySQL

### 3. Test de l'Ajout Rapide
1. **Cliquez sur "+"** à côté d'une liste
2. **Remplissez** le formulaire d'ajout rapide
3. **Validez** la création
4. **Vérifiez** que l'élément apparaît immédiatement dans la liste

### 4. Test de Création de Visite
1. **Sélectionnez** une entreprise, un employeur et un médecin
2. **Choisissez** le type de visite et la date/heure
3. **Ajoutez** des commentaires (optionnel)
4. **Validez** la création
5. **Vérifiez** que la visite est sauvegardée en base

## 🔧 Architecture Technique

### Frontend (React + TypeScript)
```typescript
// Composant principal: ProgrammerVisiteUnifie.tsx
- useEffect() pour charger les données au montage
- useState() pour gérer les états des listes
- Fonctions d'ajout rapide avec mise à jour automatique
- Validation des formulaires
- Gestion des erreurs et messages de succès
```

### Backend (Spring Boot + MySQL)
```java
// Contrôleurs API
- EntrepriseController: GET/POST /api/entreprises
- EmployeurController: GET/POST /api/employeurs  
- MedecinController: GET/POST /api/medecins
- VisiteController: POST /api/visites

// Entités JPA
- Entreprise: nom, adresse, secteur, effectif, statut
- Employeur: nom, prénom, email, téléphone, entreprise
- Medecin: nom, prénom, spécialité, disponible
- Visite: entreprise, employeur, médecin, type, date, heure
```

### Base de Données (MySQL)
```sql
-- Tables principales
- entreprises: id, nom, adresse, secteur_activite, effectif, statut
- employeurs: id, nom, prenom, email, telephone, entreprise_id
- medecins: id, nom, prenom, specialite, disponible
- visites: id, entreprise_id, employeur_id, medecin_id, type, date, heure
```

## 📊 Exemple d'Utilisation

### Scénario: Création d'une Visite Complète

1. **Chargement initial**:
   - Les listes se remplissent automatiquement depuis MySQL
   - Affichage des statistiques (X entreprises, Y employeurs, Z médecins)

2. **Ajout d'une nouvelle entreprise**:
   - Clic sur "+" → Formulaire d'ajout rapide
   - Saisie: "Tech Faso", "Technologie", "50 employés"
   - Validation → Sauvegarde en MySQL
   - **Mise à jour automatique** de la liste déroulante

3. **Sélection des données**:
   - Entreprise: "Tech Faso - Technologie"
   - Employeur: "Jean OUEDRAOGO - Tech Faso"
   - Médecin: "Dr. Amadou TRAORE - Médecine du travail"

4. **Programmation de la visite**:
   - Type: "Visite Médicale d'Aptitude"
   - Date: "2024-09-30"
   - Heure: "09:00"
   - Commentaires: "Visite de routine"

5. **Validation et sauvegarde**:
   - Création de la visite en MySQL
   - Message de succès avec détails
   - Redirection vers la liste des visites

## 🐛 Résolution des Problèmes

### Erreur: "ECONNREFUSED"
- **Cause**: Backend non démarré
- **Solution**: Démarrer le backend avec `mvn spring-boot:run`

### Erreur: "Failed to load resource: 400"
- **Cause**: Données manquantes ou invalides
- **Solution**: Vérifier les données dans MySQL

### Listes vides
- **Cause**: Pas de données en base
- **Solution**: Utiliser le test complet pour créer des données de test

### Problème de CORS
- **Cause**: Configuration CORS incorrecte
- **Solution**: Vérifier `@CrossOrigin(origins = "*")` dans les contrôleurs

## 📈 Améliorations Futures

- [ ] **Pagination** des listes pour de gros volumes
- [ ] **Cache** des données pour améliorer les performances
- [ ] **Notifications** en temps réel
- [ ] **Export** des visites programmées
- [ ] **Calendrier** intégré pour la planification
- [ ] **Géolocalisation** des entreprises

## 🎉 Conclusion

Le système de programmation de visites est maintenant **entièrement fonctionnel** avec :

✅ **Listes déroulantes dynamiques** qui se remplissent depuis MySQL  
✅ **Ajout rapide** d'entreprises, employeurs et médecins  
✅ **Mise à jour automatique** des listes après création  
✅ **Création complète** de visites avec toutes les données liées  
✅ **Sauvegarde persistante** en base MySQL  

Le système respecte parfaitement l'objectif demandé et offre une expérience utilisateur fluide et intuitive ! 🚀





