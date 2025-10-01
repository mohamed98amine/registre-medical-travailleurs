# 🚀 Configuration Mailtrap (SOLUTION IMMÉDIATE)

## Pourquoi Mailtrap ?
- ✅ Gratuit
- ✅ Pas de blocage Gmail
- ✅ Configuration simple
- ✅ Test immédiat

## Étapes :

### 1. Créer un compte Mailtrap
- Allez sur https://mailtrap.io
- Cliquez "Sign Up for Free"
- Créez un compte avec votre email

### 2. Récupérer les identifiants
- Connectez-vous
- Allez dans "Inboxes" → "My Inbox"
- Cliquez sur "SMTP Settings"
- Copiez :
  - Username
  - Password

### 3. Modifier application.properties
Remplacez dans `backend/src/main/resources/application.properties` :

```properties
# Configuration SMTP Mailtrap
spring.mail.host=smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=VOTRE_USERNAME_MAILTRAP
spring.mail.password=VOTRE_PASSWORD_MAILTRAP
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.default-encoding=UTF-8
```

### 4. Redémarrer et tester
- Redémarrez le serveur
- Testez l'envoi d'email
- Vérifiez dans Mailtrap → "My Inbox"

## Avantages :
- ✅ Pas de blocage
- ✅ Test immédiat
- ✅ Interface de visualisation
- ✅ Gratuit jusqu'à 100 emails/mois

