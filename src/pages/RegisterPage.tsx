import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, Building2, Stethoscope } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telephone, setTelephone] = useState('');
  const [role, setRole] = useState('EMPLOYEUR');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<Array<{value: string, label: string}>>([]);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Charger les rôles disponibles depuis le backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/auth/roles');
        if (response.ok) {
          const data = await response.json();
          setAvailableRoles(data.roles || []);
        } else {
          // Fallback vers les rôles statiques si l'API ne fonctionne pas
          setAvailableRoles([
            { value: 'EMPLOYEUR', label: 'Employeur' },
            { value: 'MEDECIN', label: 'Médecin' },
            { value: 'DIRECTEUR_REGIONAL', label: 'Directeur Régional' },
            { value: 'CHEF_DE_ZONE', label: 'Chef de Zone Médicale' },
            { value: 'ADMIN', label: 'Administrateur' }
          ]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des rôles:', error);
        // Fallback vers les rôles statiques
        setAvailableRoles([
          { value: 'EMPLOYEUR', label: 'Employeur' },
          { value: 'MEDECIN', label: 'Médecin' },
          { value: 'DIRECTEUR_REGIONAL', label: 'Directeur Régional' },
          { value: 'CHEF_DE_ZONE', label: 'Chef de Zone Médicale' },
          { value: 'ADMIN', label: 'Administrateur' }
        ]);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (!nom.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }

    if (nom.trim().length > 50) {
      toast.error('Le nom ne doit pas dépasser 50 caractères');
      return;
    }

    if (!email.trim()) {
      toast.error('L\'email est obligatoire');
      return;
    }

    if (email.trim().length > 50) {
      toast.error('L\'email ne doit pas dépasser 50 caractères');
      return;
    }

    // Validation du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Format d\'email invalide');
      return;
    }

    if (!password.trim()) {
      toast.error('Le mot de passe est obligatoire');
      return;
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (prenom && prenom.trim().length > 50) {
      toast.error('Le prénom ne doit pas dépasser 50 caractères');
      return;
    }

    if (telephone && telephone.trim().length > 20) {
      toast.error('Le numéro de téléphone ne doit pas dépasser 20 caractères');
      return;
    }

    setLoading(true);
    try {
      // Envoi des données avec la bonne structure
      const registerData: any = {
        email: email.trim(),
        password: password,
        nom: nom.trim(),
        role: role
      };

      // Ajouter seulement les champs optionnels qui ont des valeurs
      if (prenom && prenom.trim()) {
        registerData.prenom = prenom.trim();
      }
      if (telephone && telephone.trim()) {
        registerData.telephone = telephone.trim();
      }

      // Debug: Afficher les données envoyées
      console.log('Données envoyées au backend:', registerData);
      console.log('Rôle sélectionné:', role, '(longueur:', role.length, 'caractères)');

      await register(registerData);
      
      toast.success('Inscription réussie !');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      
      let errorMessage = 'Erreur lors de l\'inscription';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Building2 className="h-10 w-10 text-blue-600" />
            <Stethoscope className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom *
              </label>
              <input 
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={nom} 
                onChange={e => setNom(e.target.value)} 
                required 
                placeholder="Votre nom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input 
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={prenom} 
                onChange={e => setPrenom(e.target.value)} 
                placeholder="Votre prénom (optionnel)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input 
                type="email" 
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input 
                type="tel"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={telephone} 
                onChange={e => setTelephone(e.target.value)} 
                placeholder="Votre numéro (optionnel)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type de compte *
              </label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                {availableRoles.length > 0 ? (
                  availableRoles.map(roleOption => (
                    <option key={roleOption.value} value={roleOption.value}>
                      {roleOption.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="EMPLOYEUR">Employeur</option>
                    <option value="MEDECIN">Médecin</option>
                    <option value="DIRECTEUR_REGIONAL">Directeur Régional</option>
                    <option value="CHEF_DE_ZONE">Chef de Zone Médicale</option>
                    <option value="ADMIN">Administrateur</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe *
              </label>
              <div className="mt-1 relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  placeholder="Votre mot de passe"
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400" /> : 
                    <Eye className="h-5 w-5 text-gray-400" />
                  }
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe *
              </label>
              <div className="mt-1 relative">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  required 
                  placeholder="Confirmez votre mot de passe"
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 
                    <EyeOff className="h-5 w-5 text-gray-400" /> : 
                    <Eye className="h-5 w-5 text-gray-400" />
                  }
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Vous avez déjà un compte ?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;