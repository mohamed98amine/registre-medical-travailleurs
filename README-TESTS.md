# 🧪 Tests de Validation - Flux Employeurs

## 📋 Problème Résolu

Le problème de la liste déroulante des employeurs qui ne se mettait pas à jour automatiquement après création a été corrigé.

## 🚀 Démarrage Rapide

### Option 1 : Scripts Automatiques
```bash
# Windows (Batch)
start-test-servers.bat

# Windows (PowerShell)
.\start-test-servers.ps1
```

### Option 2 : Démarrage Manuel

#### 1. Backend Spring Boot
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.fork=false
```
➡️ Backend disponible sur : http://localhost:8080

#### 2. Frontend React
```bash
npm run dev
```
➡️ Frontend disponible sur : http://localhost:5173

## 🧪 Fichiers de Test

### 1. Test Simple de Création
- **Fichier :** `test-employeur-creation.html`
- **URL :** http://localhost:5173/test-employeur-creation.html
- **Description :** Test basique de création et liste des employeurs

### 2. Test Complet du Flux
- **Fichier :** `test-flux-complet-employeurs-fixed.html`
- **URL :** http://localhost:5174/test-flux-complet-employeurs-fixed.html

### 3. Test Backend Simple
- **Fichier :** `test-backend-simple.html`
- **URL :** http://localhost:5174/test-backend-simple.html
- **Description :** Test complet du flux :
  1. Création d'employeur
  2. Vérification de la liste mise à jour
  3. Programmation de visite avec le nouvel employeur
  4. Vérification des visites créées

## ✅ Validation du Fonctionnement

### Backend (Spring Boot)
- ✅ API `/api/employeurs` (GET/POST) fonctionne
- ✅ Entité `Employeur` avec champs `id`, `nom`, `email`, `telephone`, `statut`, `active`
- ✅ Repository `EmployeurRepository` utilise JPA
- ✅ Controller `EmployeurControllerSimple` retourne les objets complets

### Frontend (React)
- ✅ Page `GestionEmployeurs.tsx` utilise la nouvelle API `/api/employeurs`
- ✅ Notification `localStorage.setItem('employeursUpdated')` après création
- ✅ Page `ProgrammerVisiteDynamique.tsx` écoute les mises à jour via localStorage
- ✅ Rechargement automatique de la liste des employeurs
- ✅ Bouton de rechargement manuel avec indicateur de chargement

### Flux Complet
1. **Création Employeur** → Employeur ajouté à la liste locale + notification localStorage
2. **Notification** → `ProgrammerVisiteDynamique` détecte la mise à jour
3. **Rechargement** → Liste déroulante mise à jour automatiquement
4. **Programmation Visite** → Nouvel employeur disponible dans la liste déroulante
5. **Affichage Visite** → Visite créée avec informations employeur complètes

## 🔧 Corrections Apportées

### Backend
- ✅ Ajout du champ `active` à l'entité `Employeur` pour éviter l'erreur SQL
- ✅ Conservation du champ `statut` pour la logique métier
- ✅ Mise à jour des constructeurs, getters, setters

### Frontend
- ✅ Modification de `GestionEmployeurs.tsx` pour utiliser `/api/employeurs`
- ✅ Ajout de la notification localStorage après création
- ✅ Écoute des mises à jour dans `ProgrammerVisiteDynamique.tsx`
- ✅ Suppression des champs `prenom` et `password`
- ✅ Ajout du champ `statut` dans le formulaire

## 🎯 Résultat Attendu

Quand vous créez un employeur dans "Gérer Employeur", il apparaît **immédiatement** dans la liste déroulante de "Programmer Visite" **sans recharger la page**.

## 🐛 Dépannage

### Erreur CORS
- ❌ **Problème :** `Access to fetch at 'file:///C:/api/employeurs' from origin 'null'`
- ✅ **Solution :** Utilisez les URLs HTTP : `http://localhost:5174/test-*.html`

### Backend Hors Ligne
- ❌ **Problème :** `Failed to load resource: net::ERR_FAILED`
- ✅ **Solution :** Démarrez le backend avec `cd backend && mvn spring-boot:run`

### Frontend Hors Ligne
- ❌ **Problème :** Erreurs de connexion
- ✅ **Solution :** Démarrez le frontend avec `yarn run dev` (utilise le port 5174)

### Erreur SQL "Unknown column"
- ❌ **Problème :** `Unknown column 'v.type_visite' in 'field list'`
- ✅ **Solution :** Exécutez le script `fix-visites-table.sql` ou utilisez la version corrigée du contrôleur

## 📝 Notes

- Les tests utilisent des données de test (peuvent être modifiées dans les champs)
- Les employeurs créés via les tests sont persistés en base de données
- Les visites créées via les tests sont également persistées
- Utilisez les scripts de démarrage automatique pour une expérience optimale
