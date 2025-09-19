package com.registremedical.service;

import com.registremedical.entity.DemandeAffiliation;
import com.registremedical.entity.User;
import com.registremedical.enums.StatutAffiliation;
import com.registremedical.repository.DemandeAffiliationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class DemandeAffiliationService {

    @Autowired
    private DemandeAffiliationRepository demandeAffiliationRepository;

    public DemandeAffiliation createDemande(String raisonSociale, String numeroRccm, String secteurActivite,
                                          Integer effectif, String adresse, String representantLegal,
                                          String email, String telephone, String contactDrh,
                                          Double chiffreAffaireAnnuel, String commentaires,
                                          User employeur, User directeurRegional) {
        
        System.out.println("=== SERVICE: Création demande ===");
        
        DemandeAffiliation demande = new DemandeAffiliation();
        demande.setRaisonSociale(raisonSociale);
        demande.setNumeroRccm(numeroRccm);
        demande.setSecteurActivite(secteurActivite);
        demande.setEffectif(effectif);
        demande.setAdresse(adresse);
        demande.setRepresentantLegal(representantLegal);
        demande.setEmail(email);
        demande.setTelephone(telephone);
        demande.setContactDrh(contactDrh);
        demande.setChiffreAffaireAnnuel(chiffreAffaireAnnuel);
        demande.setCommentaires(commentaires);
        demande.setStatut(StatutAffiliation.NOUVELLE);
        demande.setDateCreation(LocalDateTime.now());
        demande.setDateModification(LocalDateTime.now());
        demande.setEmployeur(employeur);
        demande.setDirecteurRegional(directeurRegional);

        System.out.println("Avant save - Employeur ID: " + employeur.getId());
        System.out.println("Avant save - Directeur ID: " + (directeurRegional != null ? directeurRegional.getId() : "null"));

        DemandeAffiliation saved = demandeAffiliationRepository.saveAndFlush(demande);
        
        System.out.println("Après save - ID: " + saved.getId());
        System.out.println("Total demandes: " + demandeAffiliationRepository.count());
        
        return saved;
    }

    public List<DemandeAffiliation> getDemandesByEmployeur(User employeur) {
        return demandeAffiliationRepository.findByEmployeurOrderByDateCreationDesc(employeur);
    }

    public List<DemandeAffiliation> getDemandesByDirecteur(User directeur) {
        return demandeAffiliationRepository.findByDirecteurRegionalOrderByDateCreationDesc(directeur);
    }

    public DemandeAffiliation approuverDemande(Long id, String commentaires) {
        DemandeAffiliation demande = demandeAffiliationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        
        demande.setStatut(StatutAffiliation.VALIDEE);
        demande.setDateModification(LocalDateTime.now());
        if (commentaires != null) {
            demande.setCommentaires(commentaires);
        }
        
        return demandeAffiliationRepository.saveAndFlush(demande);
    }

    public DemandeAffiliation rejeterDemande(Long id, String motifRejet, String commentaires) {
        DemandeAffiliation demande = demandeAffiliationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        
        demande.setStatut(StatutAffiliation.REJETEE);
        demande.setMotifRejet(motifRejet);
        demande.setDateModification(LocalDateTime.now());
        if (commentaires != null) {
            demande.setCommentaires(commentaires);
        }
        
        return demandeAffiliationRepository.saveAndFlush(demande);
    }
}