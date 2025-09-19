# 🔧 Correction de l'alerte de sécurité Gmail

## Problème identifié
L'alerte de sécurité Google bloque l'envoi d'emails depuis `test.registre.medical@gmail.com`.

## Solutions

### Solution 1: Configuration Gmail App Password (Recommandée)

1. **Connectez-vous à votre compte Gmail** `test.registre.medical@gmail.com`

2. **Activez la vérification en 2 étapes** (si pas déjà fait)
   - Allez sur https://myaccount.google.com/security
   - Activez "Vérification en 2 étapes"

3. **Générez un mot de passe d'application**
   - Dans "Sécurité" → "Mots de passe des applications"
   - Sélectionnez "Autre" et nommez "Registre Medical"
   - Copiez le mot de passe de 16 caractères

4. **Modifiez `backend/src/main/resources/application.properties`**
   ```properties
   spring.mail.password=VOTRE_MOT_DE_PASSE_16_CARACTERES
   ```

### Solution 2: Utiliser une adresse email différente

Modifiez dans `application.properties`:
```properties
spring.mail.username=VOTRE_EMAIL@gmail.com
spring.mail.password=VOTRE_MOT_DE_PASSE_APP
```

### Solution 3: Configuration SMTP alternative

Pour tester rapidement, utilisez Mailtrap (gratuit):
```properties
spring.mail.host=smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=VOTRE_USERNAME_MAILTRAP
spring.mail.password=VOTRE_PASSWORD_MAILTRAP
```

## Test de l'envoi

Après configuration, redémarrez le serveur et testez:
1. Créez une demande d'affiliation
2. Assignez une zone
3. Cliquez sur "Contrat"
4. Vérifiez votre boîte mail

## Vérification des emails

Les emails peuvent arriver dans:
- **Boîte de réception principale**
- **Onglet "Promotions"** (très probable)
- **Spam/Courrier indésirable**

Cherchez un email avec le sujet: "Contrat d'affiliation - CT-XXXX"
