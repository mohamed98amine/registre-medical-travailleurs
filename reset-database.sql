-- Script pour réinitialiser complètement la base de données
-- Exécutez ce script dans MySQL Workbench ou phpMyAdmin

-- Supprimer la base de données existante
DROP DATABASE IF EXISTS registre_medical;

-- Recréer la base de données
CREATE DATABASE registre_medical CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utiliser la nouvelle base
USE registre_medical;

-- La table sera recréée automatiquement par Hibernate avec la bonne structure
-- Vérification que la base est vide
SHOW TABLES;
