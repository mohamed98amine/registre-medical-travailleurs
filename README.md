# 🏥 Registre Médical des Travailleurs - Burkina Faso

Une plateforme complète de gestion du registre médical des travailleurs, développée avec Spring Boot et ReactJS, conforme aux réglementations du Burkina Faso.

## 🚀 Fonctionnalités

### 👥 Types d'utilisateurs
- **Employeur** : Gestion des entreprises, travailleurs et visites médicales
- **Médecin** : Consultation des dossiers, saisie des résultats et gestion du planning
- **Chef de Zone** : Supervision et coordination des activités médicales
- **Directeur Régional** : Gestion des affiliations et supervision générale

### 🏢 Gestion des entreprises
- Création et modification des profils d'entreprise
- Informations complètes (raison sociale, secteur, effectif, contact)
- Zones d'affectation géographiques
- Système d'affiliation et de contrats

### 👷 Gestion des travailleurs
- Fiches complètes des travailleurs avec données MySQL
- Matricules uniques et traçabilité
- Historique des expositions professionnelles
- Contact et adresse détaillés

### 🩺 Système de visites médicales
- **Demandes de visite** : Les employeurs peuvent demander des visites médicales
- **Sélection de médecins** : Choix par spécialité et zone géographique
- **Gestion des consultations** : Interface médecin pour accepter/refuser les demandes
- **Génération de certificats** : Certificats d'aptitude au format PDF officiel Burkina Faso
- **Notifications** : Système de notifications en temps réel

### 📋 Certificats médicaux
- **Génération automatique** : Certificats d'aptitude conformes à la réglementation burkinabè
- **Format officiel** : En-tête Burkina Faso, références légales (Loi n°028-2008/AN)
- **Téléchargement PDF** : Certificats téléchargeables par les employeurs
- **Traçabilité** : Historique complet des certificats générés

### 📊 Tableau de bord et statistiques
- Statistiques en temps réel par rôle utilisateur
- Taux d'aptitude des travailleurs
- Nombre de visites et de consultations
- Rapports périodiques et analyses

### 🗺️ Gestion géographique
- Zones GPS du Burkina Faso
- Assignation automatique par localisation
- Carte interactive du pays
- Gestion des régions et provinces

## 📁 Structure du projet

```
registre-medical-travailleurs/
├── backend/                          # Application Spring Boot
│   ├── src/main/java/com/registremedical/
│   │   ├── config/                   # Configuration (Sécurité, Swagger)
│   │   ├── controller/               # Contrôleurs REST
│   │   │   ├── ConsultationMedecinController.java  # Gestion consultations
│   │   │   ├── PublicController.java               # API publique
│   │   │   └── DisponibiliteSimpleController.java  # Disponibilités médecins
│   │   ├── dto/                      # Objets de transfert de données
│   │   ├── entity/                   # Entités JPA
│   │   ├── exception/                # Gestion des exceptions
│   │   ├── repository/               # Repositories JPA
│   │   ├── security/                 # Configuration JWT
│   │   ├── service/                  # Couche métier
│   │   └── RegistreMedicalApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties    # Configuration
│   │   └── data.sql                  # Données d'initialisation
│   └── pom.xml                      # Dépendances Maven
├── frontend/                         # Application React TypeScript
│   ├── src/
│   │   ├── components/               # Composants réutilisables
│   │   │   ├── Header.tsx           # En-tête moderne
│   │   │   ├── Sidebar.tsx          # Navigation latérale
│   │   │   └── CertificatMedicalForm.tsx  # Formulaire certificats
│   │   ├── contexts/                 # Contextes React
│   │   │   └── AuthContext.tsx      # Authentification
│   │   ├── pages/                    # Pages de l'application
│   │   │   ├── MesConsultations.tsx # Interface médecin
│   │   │   ├── DemandeVisiteForm.tsx # Demandes de visite
│   │   │   ├── CertificatsEmployeur.tsx # Certificats employeur
│   │   │   └── DisponibiliteMedecin.tsx # Gestion disponibilités
│   │   ├── services/                 # Services API
│   │   ├── types/                    # Types TypeScript
│   │   ├── AppRouter.tsx            # Configuration des routes
│   │   ├── main.tsx                 # Point d'entrée
│   │   └── index.css               # Styles globaux modernes
│   ├── package.json                  # Dépendances npm
│   └── tailwind.config.js           # Configuration Tailwind
└── README.md
```

## 🛠️ Technologies utilisées

### Backend
- **Spring Boot 3.x** - Framework Java
- **Spring Security** - Authentification JWT
- **Spring Data JPA** - Accès aux données
- **MySQL** - Base de données principale
- **Maven** - Gestion des dépendances
- **Swagger/OpenAPI** - Documentation API

### Frontend
- **React 18** - Framework JavaScript
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Icônes modernes
- **React Router** - Navigation
- **Vite** - Build tool moderne

### Base de données
- **MySQL** - Données des travailleurs et entreprises
- **Tables principales** :
  - `travailleurs` - Informations des employés
  - `medecins` - Profils des médecins
  - `demandes_visite_simple` - Demandes de consultations
  - `certificats_simple` - Certificats générés
  - `notifications_employeur` - Système de notifications

## 🚀 Installation et démarrage

### Prérequis
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.6+

### Backend

1. **Cloner le projet**
```bash
git clone https://github.com/votre-username/registre-medical-travailleurs.git
cd registre-medical-travailleurs/backend
```

2. **Configurer la base de données**
```bash
# Créer une base MySQL
mysql -u root -p
CREATE DATABASE registre_medical;
```

3. **Configuration application.properties**
```properties
# Base de données
spring.datasource.url=jdbc:mysql://localhost:3306/registre_medical
spring.datasource.username=root
spring.datasource.password=votre_mot_de_passe
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT
app.jwt.secret=votre-secret-jwt-super-securise
app.jwt.expiration=86400000

# Server
server.port=8080
```

4. **Lancer l'application**
```bash
mvn spring-boot:run
```

L'API sera disponible sur `http://localhost:8080`
Swagger UI : `http://localhost:8080/swagger-ui.html`

### Frontend

1. **Installer les dépendances**
```bash
cd ../frontend
npm install
```

2. **Lancer l'application**
```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## 🔐 Authentification

### Comptes par défaut
- **Employeur** : `employeur@test.com` / `password123`
- **Médecin** : `ouedrao666gomohamedamine98@gmail.com` / `password123`
- **Chef de Zone** : `chef@zone.com` / `password123`

### Fonctionnalités d'authentification
- Authentification JWT sécurisée
- Gestion des rôles et permissions
- Sessions persistantes
- Déconnexion sécurisée

## 📋 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `POST /api/auth/logout` - Déconnexion

### Consultations médicales
- `GET /api/consultations/medecin/{email}` - Consultations d'un médecin
- `POST /api/consultations/demande-visite` - Créer une demande
- `PUT /api/consultations/{id}/statut` - Mettre à jour le statut
- `POST /api/consultations/generer-certificat` - Générer un certificat
- `GET /api/consultations/certificat/pdf/{id}` - Télécharger certificat PDF

### Médecins et spécialités
- `GET /api/public/medecins/specialite/{specialite}` - Médecins par spécialité
- `GET /api/public/specialites` - Liste des spécialités

### Travailleurs
- `GET /api/consultations/consultation/{id}/travailleurs` - Travailleurs MySQL

## 🎨 Interface utilisateur

### Design moderne et professionnel
- **Header redesigné** : Avatar avec initiales, suppression de l'email
- **Sidebar responsive** : Navigation adaptative selon le rôle
- **Cartes modernes** : Ombres, animations, hover effects
- **Couleurs cohérentes** : Palette professionnelle
- **Animations fluides** : Transitions CSS personnalisées

### Pages principales
- **Dashboard** : Statistiques et actions rapides
- **Mes Consultations** : Interface médecin moderne
- **Demandes de visite** : Formulaire employeur intuitif
- **Certificats** : Génération et téléchargement PDF
- **Disponibilités** : Gestion planning médecin

## 📄 Certificats médicaux

### Format officiel Burkina Faso
- En-tête : "BURKINA FASO - MINISTÈRE DU TRAVAIL"
- Informations médecin : Dr. Mohamed Amine OUEDRAOGO
- Lieu : Ouagadougou
- Références légales : Loi n°028-2008/AN
- Conclusions : APTE / INAPTE / APTE AVEC RESTRICTIONS

### Fonctionnalités
- Génération automatique PDF
- Sélection multiple de travailleurs
- Observations médicales personnalisées
- Téléchargement par les employeurs
- Historique complet

## 🔒 Sécurité

- **JWT** pour l'authentification
- **Spring Security** pour l'autorisation
- **Validation** des données côté serveur
- **CORS** configuré pour le développement
- **Gestion des rôles** granulaire
- **Protection CSRF**

## 📊 Base de données

### Tables principales
- **users** : Utilisateurs et authentification
- **medecins** : Profils des médecins avec spécialités
- **travailleurs** : Données MySQL des employés
- **demandes_visite_simple** : Demandes de consultations
- **certificats_simple** : Certificats générés
- **notifications_employeur** : Système de notifications

### Relations
- Un médecin peut avoir plusieurs consultations
- Une demande peut concerner plusieurs travailleurs
- Un certificat est lié à une consultation et un travailleur

## 🧪 Tests

### Backend
```bash
mvn test
```

### Frontend
```bash
npm run test
```

## 🚀 Déploiement

### Backend (Production)
```bash
mvn clean package -Pprod
java -jar target/registre-medical-travailleurs-1.0.0.jar
```

### Frontend (Production)
```bash
npm run build
# Déployer le dossier dist/
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📞 Contact

**Développeur** : Mohamed Amine OUEDRAOGO  
**Email** : omohamedamine98@gmail.com  
**Projet** : Registre Médical des Travailleurs - Burkina Faso

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🔄 Versions

- **v1.0.0** - Version initiale complète
  - ✅ Système de consultations médicales
  - ✅ Génération de certificats PDF Burkina Faso
  - ✅ Interface moderne et responsive
  - ✅ Authentification JWT sécurisée
  - ✅ Intégration MySQL pour les travailleurs
  - ✅ Système de notifications en temps réel
  - ✅ Gestion des disponibilités médecins

---

**Développé avec ❤️ pour la santé au travail au Burkina Faso**