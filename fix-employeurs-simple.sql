-- Script simple pour corriger la table employeurs
-- À exécuter dans phpMyAdmin ou MySQL Workbench

USE registre_medical;

-- Supprimer le champ 'active' s'il existe
ALTER TABLE employeurs DROP COLUMN IF EXISTS active;

-- Ajouter le champ 'statut' s'il n'existe pas déjà
ALTER TABLE employeurs ADD COLUMN IF NOT EXISTS statut VARCHAR(20) DEFAULT 'Actif';

-- Mettre à jour les enregistrements existants
UPDATE employeurs SET statut = 'Actif' WHERE statut IS NULL;




