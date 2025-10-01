# 🗺️ Guide d'installation Google Maps API

## 🚨 **ERREUR ACTUELLE :**
Vous avez l'erreur `InvalidKeyMapError` car la clé API utilisée n'est pas valide.

## 📋 **ÉTAPES POUR OBTENIR UNE CLÉ API GOOGLE MAPS :**

### **1. Créer un compte Google Cloud Console**
1. Allez sur : https://console.cloud.google.com/
2. Créez un compte Google si nécessaire
3. Créez un nouveau projet ou sélectionnez un projet existant

### **2. Activer l'API Google Maps JavaScript**
1. Dans la console, allez dans **"API et services"** > **"Bibliothèque"**
2. Recherchez **"Maps JavaScript API"**
3. Cliquez dessus et **activez l'API**

### **3. Créer des identifiants (clé API)**
1. Allez dans **"API et services"** > **"Identifiants"**
2. Cliquez sur **"+ CRÉER DES IDENTIFIANTS"**
3. Sélectionnez **"Clé API"**
4. La clé API sera générée automatiquement

### **4. Configurer les restrictions (IMPORTANT)**
1. Cliquez sur la clé API créée
2. Dans **"Restrictions d'API"** :
   - Sélectionnez **"Restreindre la clé"**
   - Cochez **"Maps JavaScript API"**
3. Dans **"Restrictions d'application"** :
   - Sélectionnez **"Sites web (HTTP referrers)"**
   - Ajoutez vos domaines :
     - `localhost:5173` (pour le développement)
     - `localhost:3000` (si vous utilisez un autre port)
     - Votre domaine de production

### **5. Configurer la clé dans le code**

#### **Option 1 : Remplacer directement dans le fichier**
Ouvrez `src/components/GoogleMap.tsx` et remplacez :
```javascript
// LIGNE 37 - Remplacez YOUR_GOOGLE_MAPS_API_KEY par votre vraie clé
script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&v=3.exp&libraries=geometry,drawing&callback=initMap`;
```

#### **Option 2 : Utiliser une variable d'environnement**
1. Créez un fichier `.env.local` dans la racine du projet
2. Ajoutez votre clé :
```
VITE_GOOGLE_MAPS_API_KEY=votre_vraie_clé_api_ici
```
3. Modifiez le fichier `src/components/GoogleMap.tsx` :
```javascript
// Remplacez la ligne 37 par :
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';
script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=3.exp&libraries=geometry,drawing&callback=initMap`;
```

## 💰 **COÛTS ET QUOTAS :**

### **Gratuit (jusqu'à 28 000 requêtes/mois) :**
- ✅ Maps JavaScript API : 28 000 requêtes/mois gratuites
- ✅ Géocodage : 40 000 requêtes/mois gratuites
- ✅ Places API : 20 000 requêtes/mois gratuites

### **Au-delà des quotas :**
- Maps JavaScript API : $7/1 000 requêtes supplémentaires
- Géocodage : $5/1 000 requêtes supplémentaires

## 🔒 **SÉCURITÉ :**
- ✅ **Activez toujours les restrictions** sur votre clé API
- ✅ **Ne partagez jamais** votre clé API dans le code public
- ✅ **Utilisez des variables d'environnement** pour la production

## 🧪 **TEST DE LA CONFIGURATION :**

1. **Redémarrez votre serveur de développement :**
```bash
npm run dev
```

2. **Allez dans "Zones GPS"** dans le dashboard Directeur

3. **Vérifiez que la carte s'affiche** sans erreur

## 🎯 **FONCTIONNALITÉS DISPONIBLES :**

Une fois configuré, vous aurez :
- 🛰️ **Vue satellite** pour voir les villages
- 🔴 **Marqueur rouge** personnalisé
- 🖱️ **Zoom et déplacement** comme Google Maps
- 📍 **Centrage sur Ouagadougou**
- 🏥 **Info-bulle détaillée** au clic

## ❓ **PROBLÈMES COURANTS :**

### **Erreur "InvalidKeyMapError"**
- Vérifiez que la clé API est correcte
- Vérifiez que l'API Maps JavaScript est activée
- Vérifiez les restrictions de domaine

### **Erreur "RefererNotAllowedMapError"**
- Ajoutez votre domaine dans les restrictions
- Pour le développement : `localhost:5173`

### **Carte ne s'affiche pas**
- Vérifiez la console du navigateur (F12)
- Vérifiez que la clé API a des crédits suffisants

## 📞 **SUPPORT :**
Si vous avez des problèmes, consultez :
- [Documentation Google Maps](https://developers.google.com/maps/documentation/javascript)
- [Console Google Cloud](https://console.cloud.google.com/)

---

**🎉 Une fois configuré, votre carte Google Maps sera pleinement fonctionnelle !**