// Script pour tester la création d'une demande d'affiliation
async function testCreateDemande() {
    try {
        // 1. Se connecter en tant qu'employeur
        console.log('🔐 Connexion en tant qu\'employeur...');
        const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'employeur@test.com',
                password: 'password123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Erreur de connexion: ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✅ Connexion réussie');

        // 2. Créer une demande d'affiliation
        console.log('📝 Création d\'une demande d\'affiliation...');
        const demandeData = {
            raisonSociale: 'SARL Test Entreprise',
            numeroRccm: 'RCCM-TEST-001',
            secteurActivite: 'Informatique',
            effectif: 10,
            adresse: 'Ouagadougou, Burkina Faso',
            representantLegal: 'Jean Dupont',
            email: 'contact@testentreprise.bf',
            telephone: '+226 70 12 34 56',
            contactDrh: 'Marie Koura',
            chiffreAffaireAnnuel: 50000000
        };

        const createResponse = await fetch('http://localhost:8080/api/demandes-affiliation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(demandeData)
        });

        if (!createResponse.ok) {
            const errorText = await createResponse.text();
            throw new Error(`Erreur de création: ${createResponse.status} - ${errorText}`);
        }

        const demandeCreated = await createResponse.json();
        console.log('✅ Demande créée avec succès:', demandeCreated);

        // 3. Vérifier que la demande a été stockée
        console.log('🔍 Vérification des demandes...');
        const getResponse = await fetch('http://localhost:8080/api/demandes-affiliation/mes-demandes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (getResponse.ok) {
            const demandes = await getResponse.json();
            console.log('✅ Demandes récupérées:', demandes);
        } else {
            console.log('❌ Erreur lors de la récupération des demandes');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

// Exécuter le test
testCreateDemande();







