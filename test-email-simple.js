// Test simple d'envoi d'email
// Ouvrez la console (F12) et collez ce code

const testEmail = async () => {
  console.log('🧪 Test d\'envoi d\'email...');
  
  const response = await fetch('http://localhost:8080/api/contrats/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({
      numeroContrat: "TEST-" + Date.now(),
      raisonSociale: "Test Email",
      email: "omohamedamine98@gmail.com",
      zone: "Zone Test",
      montant: 50000
    })
  });

  const result = await response.json();
  console.log('Résultat:', result);
  
  if (response.ok) {
    console.log('✅ Email envoyé ! Vérifiez votre boîte mail');
  } else {
    console.log('❌ Erreur:', result.error);
  }
};

testEmail();

