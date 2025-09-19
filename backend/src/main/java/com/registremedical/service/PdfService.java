package com.registremedical.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    public byte[] generateContratPdf(String numeroContrat,
                                     String raisonSociale,
                                     String zone,
                                     double montantXof) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(doc, baos);
        doc.open();

        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
        Font subtitleFont = new Font(Font.HELVETICA, 14, Font.BOLD);
        Font normal = new Font(Font.HELVETICA, 12);
        Font small = new Font(Font.HELVETICA, 10);

        // En-tête
        Paragraph title = new Paragraph("CONTRAT D'AFFILIATION", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
        
        Paragraph subtitle = new Paragraph("Service de Santé au Travail", subtitleFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        doc.add(subtitle);
        
        doc.add(new Paragraph("\n"));

        // Informations du contrat
        Paragraph infoTitle = new Paragraph("INFORMATIONS DU CONTRAT", subtitleFont);
        infoTitle.setSpacingBefore(20);
        doc.add(infoTitle);

        PdfPTable infoTable = new PdfPTable(2);
        infoTable.setWidthPercentage(100);
        infoTable.setSpacingBefore(10);
        
        infoTable.addCell(cell("Numéro de contrat", true));
        infoTable.addCell(cell(numeroContrat, false));
        infoTable.addCell(cell("Date de génération", true));
        infoTable.addCell(cell(java.time.LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")), false));
        infoTable.addCell(cell("Entreprise", true));
        infoTable.addCell(cell(raisonSociale != null ? raisonSociale : "Non spécifié", false));
        infoTable.addCell(cell("Zone assignée", true));
        infoTable.addCell(cell(zone, false));
        infoTable.addCell(cell("Montant annuel (XOF)", true));
        infoTable.addCell(cell(String.format("%,.0f", montantXof).replace(',', ' '), false));
        infoTable.addCell(cell("Montant mensuel (XOF)", true));
        infoTable.addCell(cell(String.format("%,.0f", montantXof / 12).replace(',', ' '), false));
        
        doc.add(infoTable);

        // Conditions générales
        doc.add(new Paragraph("\n"));
        Paragraph conditionsTitle = new Paragraph("CONDITIONS GÉNÉRALES", subtitleFont);
        conditionsTitle.setSpacingBefore(20);
        doc.add(conditionsTitle);

        doc.add(new Paragraph("Article 1 - Objet", new Font(Font.HELVETICA, 12, Font.BOLD)));
        doc.add(new Paragraph("Le présent contrat d'affiliation lie l'entreprise " + 
            (raisonSociale != null ? raisonSociale : "[Nom de l'entreprise]") + 
            " au Service de Santé au Travail pour la surveillance médicale de ses employés.", normal));

        doc.add(new Paragraph("\nArticle 2 - Zone d'intervention", new Font(Font.HELVETICA, 12, Font.BOLD)));
        doc.add(new Paragraph("La zone d'intervention assignée est : " + zone + ".", normal));

        doc.add(new Paragraph("\nArticle 3 - Tarification", new Font(Font.HELVETICA, 12, Font.BOLD)));
        doc.add(new Paragraph("Le montant annuel de l'affiliation s'élève à " + 
            String.format("%,.0f", montantXof).replace(',', ' ') + " XOF, soit " + 
            String.format("%,.0f", montantXof / 12).replace(',', ' ') + " XOF par mois.", normal));

        doc.add(new Paragraph("\nArticle 4 - Durée", new Font(Font.HELVETICA, 12, Font.BOLD)));
        doc.add(new Paragraph("Le présent contrat est conclu pour une durée d'un an renouvelable tacitement.", normal));

        doc.add(new Paragraph("\nArticle 5 - Modalités de paiement", new Font(Font.HELVETICA, 12, Font.BOLD)));
        doc.add(new Paragraph("Le paiement s'effectue mensuellement, dans les 30 jours suivant l'émission de la facture.", normal));

        // Pied de page
        doc.add(new Paragraph("\n\n"));
        Paragraph signature = new Paragraph("Signature du Directeur Régional", subtitleFont);
        signature.setAlignment(Element.ALIGN_RIGHT);
        doc.add(signature);
        
        doc.add(new Paragraph("\n"));
        Paragraph date = new Paragraph("Date : ________________", normal);
        date.setAlignment(Element.ALIGN_RIGHT);
        doc.add(date);

        doc.close();
        return baos.toByteArray();
    }

    private PdfPCell cell(String text, boolean header) {
        Font f = new Font(Font.HELVETICA, header ? 12 : 12, header ? Font.BOLD : Font.NORMAL);
        PdfPCell c = new PdfPCell(new Phrase(text, f));
        c.setPadding(6);
        return c;
    }
}









