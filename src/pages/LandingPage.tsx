import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon, ShieldCheckIcon, UserIcon, BuildingIcon, CalendarIcon } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm fixed w-full top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="h-8 w-8 text-green-600" />
            <h1 className="text-xl font-bold text-green-800">OST Burkina</h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Connexion
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              S'inscrire
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content with padding for fixed header */}
      <div className="pt-20">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-6 leading-tight">
              Office de Santé des Travailleurs
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Plateforme numérique intégrée pour la gestion des prestations de
              santé au travail au Burkina Faso.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/login')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                Accéder à la plateforme
                <ArrowRightIcon className="h-5 w-5" />
              </button>
              <button className="border-2 border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 rounded-md font-medium transition-all duration-300">
                En savoir plus
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" alt="Professionnels de la santé au travail" className="rounded-lg shadow-2xl max-w-full h-auto animate-fade-in-up" />
              <div className="absolute -bottom-6 -right-6 bg-green-100 p-4 rounded-lg shadow-lg animate-fade-in">
                <p className="text-green-800 font-medium">
                  Protection de la santé des travailleurs
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Features Section */}
        <section className="bg-green-50 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-green-800 mb-16">
              Nos Services
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-green-100 p-3 rounded-full inline-block mb-4">
                  <UserIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  Gestion des Travailleurs
                </h3>
                <p className="text-gray-600">
                  Suivez les dossiers médicaux, gérez les mutations et assurez
                  la confidentialité des données médicales.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-green-100 p-3 rounded-full inline-block mb-4">
                  <BuildingIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  Affiliation d'Entreprises
                </h3>
                <p className="text-gray-600">
                  Gérez les contrats annuels, les demandes d'affiliation et
                  assignez les entreprises aux zones médicales.
                </p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="bg-green-100 p-3 rounded-full inline-block mb-4">
                  <CalendarIcon className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-800 mb-4">
                  Planification des Visites
                </h3>
                <p className="text-gray-600">
                  Programmez les visites médicales, coordonnez avec les
                  employeurs et optimisez les déplacements.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-12 text-center text-white shadow-xl">
            <h2 className="text-3xl font-bold mb-6">
              Prêt à moderniser votre gestion de santé au travail?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Rejoignez notre plateforme numérique pour améliorer l'efficacité
              de vos services et garantir une meilleure traçabilité des données
              médicales.
            </p>
            <button onClick={() => navigate('/login')} className="bg-white text-green-700 px-8 py-3 rounded-md font-medium hover:bg-green-50 transition-all duration-300 shadow-lg">
              Commencer maintenant
            </button>
          </div>
        </section>
        {/* Footer */}
        <footer className="bg-green-800 text-white py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2 mb-6 md:mb-0">
                <ShieldCheckIcon className="h-8 w-8" />
                <h2 className="text-xl font-bold">OST Burkina</h2>
              </div>
              <div className="flex flex-col md:flex-row gap-8">
                <div>
                  <h3 className="font-semibold mb-2">Contact</h3>
                  <p>contact@ost-burkina.org</p>
                  <p>+226 XX XX XX XX</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Adresse</h3>
                  <p>Ouagadougou, Burkina Faso</p>
                </div>
              </div>
            </div>
            <div className="border-t border-green-700 mt-8 pt-8 text-center">
              <p>
                &copy; {new Date().getFullYear()} Office de Santé des
                Travailleurs. Tous droits réservés.
              </p>
            </div>
          </div>
        </footer>
      </div>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-out;
        }
        .animate-fade-in {
          animation: fadeIn 1.5s ease-out;
        }
      `}</style>
    </div>;
}