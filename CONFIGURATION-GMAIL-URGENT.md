# 🚨 CONFIGURATION GMAIL URGENTE

## Problème
Gmail bloque les emails car `test.registre.medical@gmail.com` n'a pas de mot de passe d'application configuré.

## Solution IMMÉDIATE

### Étape 1 : Se connecter au compte Gmail
1. Allez sur https://mail.google.com
2. Connectez-vous avec : `test.registre.medical@gmail.com`
3. Mot de passe : [mot de passe du compte]

### Étape 2 : Activer la vérification en 2 étapes
1. Allez sur https://myaccount.google.com/security
2. Cliquez sur "Vérification en 2 étapes"
3. Activez-la si ce n'est pas fait

### Étape 3 : Générer un mot de passe d'application
1. Dans "Sécurité" → "Mots de passe des applications"
2. Sélectionnez "Autre" et tapez "Registre Medical"
3. **COPIEZ LE MOT DE PASSE DE 16 CARACTÈRES** (ex: abcd efgh ijkl mnop)

### Étape 4 : Modifier le fichier de configuration
1. Ouvrez : `backend/src/main/resources/application.properties`
2. Trouvez la ligne 41 : `spring.mail.password=your_app_password_here`
3. Remplacez par : `spring.mail.password=VOTRE_MOT_DE_PASSE_16_CARACTERES`

### Étape 5 : Redémarrer le serveur
1. Arrêtez le serveur backend (Ctrl+C)
2. Redémarrez-le

### Étape 6 : Tester
1. Créez une demande d'affiliation
2. Assignez une zone
3. Cliquez sur "Contrat"
4. Vérifiez votre boîte mail : omohamedamine98@gmail.com

## Vérification des emails
Cherchez dans :
- **Onglet "Promotions"** ← TRÈS IMPORTANT
- **Dossier "Spam"**
- **Boîte de réception**

Sujet : "Contrat d'affiliation - CT-XXXX"
