// DIAGNOSTIC COMPLET - Copiez ce code dans la console (F12)

console.log('🔍 DIAGNOSTIC COMPLET DES EMAILS');
console.log('================================');

// 1. Test de connexion au serveur
const testServerConnection = async () => {
  console.log('\n1️⃣ Test de connexion au serveur...');
  try {
    const response = await fetch('http://localhost:8080/api/contrats/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        numeroContrat: "DIAG-" + Date.now(),
        raisonSociale: "Test Diagnostic",
        email: "omohamedamine98@gmail.com",
        zone: "Zone Test",
        montant: 75000
      })
    });

    console.log('📊 Statut de la réponse:', response.status);
    const result = await response.json();
    console.log('📧 Résultat complet:', result);

    if (response.ok) {
      console.log('✅ SERVEUR OK - Email envoyé avec succès');
      console.log('📬 Vérifiez votre boîte mail dans:');
      console.log('   - Onglet "Promotions" (TRÈS IMPORTANT)');
      console.log('   - Dossier "Spam"');
      console.log('   - Boîte de réception principale');
    } else {
      console.log('❌ ERREUR SERVEUR:', result.error);
      
      if (result.error.includes('Authentication') || result.error.includes('535')) {
        console.log('🔧 PROBLÈME: Authentification Gmail échouée');
        console.log('📋 Solutions:');
        console.log('   1. Vérifiez que le mot de passe d\'app est correct');
        console.log('   2. Redémarrez le serveur backend');
        console.log('   3. Vérifiez que la vérification en 2 étapes est activée');
      }
    }
  } catch (error) {
    console.log('❌ ERREUR DE CONNEXION:', error.message);
    console.log('🔧 SOLUTION: Vérifiez que le serveur backend est démarré');
  }
};

// 2. Vérifier la configuration
const checkConfiguration = () => {
  console.log('\n2️⃣ Vérification de la configuration...');
  const token = localStorage.getItem('token');
  if (token) {
    console.log('✅ Token JWT trouvé');
  } else {
    console.log('❌ Pas de token JWT - Connectez-vous d\'abord');
  }
  
  console.log('📧 Email de destination: omohamedamine98@gmail.com');
  console.log('🔧 Mot de passe d\'app configuré: govn aztb juox ijzr');
};

// 3. Instructions pour vérifier Gmail
const checkGmailInstructions = () => {
  console.log('\n3️⃣ Instructions pour vérifier Gmail...');
  console.log('📧 Ouvrez votre Gmail: https://mail.google.com');
  console.log('🔍 Cherchez dans ces onglets:');
  console.log('   1. "Principale" (onglet actuel)');
  console.log('   2. "Promotions" ← TRÈS IMPORTANT');
  console.log('   3. "Réseaux sociaux"');
  console.log('   4. "Notifications"');
  console.log('📄 Sujet recherché: "Contrat d\'affiliation - DIAG-XXXX"');
  console.log('📅 Date: Aujourd\'hui');
};

// 4. Test alternatif avec Mailtrap
const suggestMailtrap = () => {
  console.log('\n4️⃣ Si Gmail ne fonctionne toujours pas...');
  console.log('🚀 SOLUTION ALTERNATIVE: Mailtrap (gratuit)');
  console.log('📋 Étapes:');
  console.log('   1. Allez sur https://mailtrap.io');
  console.log('   2. Créez un compte gratuit');
  console.log('   3. Copiez les identifiants SMTP');
  console.log('   4. Remplacez dans application.properties');
};

// Exécuter tous les tests
const runDiagnostic = async () => {
  checkConfiguration();
  await testServerConnection();
  checkGmailInstructions();
  suggestMailtrap();
  
  console.log('\n🎯 PROCHAINES ÉTAPES:');
  console.log('1. Redémarrez le serveur backend si nécessaire');
  console.log('2. Vérifiez l\'onglet "Promotions" dans Gmail');
  console.log('3. Si ça ne marche pas, essayez Mailtrap');
};

// Lancer le diagnostic
runDiagnostic();

