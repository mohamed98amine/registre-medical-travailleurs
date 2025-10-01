import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  Activity, 
  Heart,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  Eye,
  MoreHorizontal
} from 'lucide-react';

// =================================
// CARTES DE STATISTIQUES MÉDICALES
// =================================

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
  };
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  subtitle?: string;
}

export const MedicalStatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color,
  subtitle
}) => {
  const colorClasses = {
    blue: 'stat-card-blue',
    green: 'stat-card-green',
    purple: 'stat-card-purple',
    orange: 'stat-card-orange',
    red: 'bg-gradient-to-br from-red-500 to-red-600'
  };

  const getTrendIcon = () => {
    if (!change) return null;
    
    return change.type === 'positive' ? (
      <TrendingUp className="h-4 w-4" />
    ) : change.type === 'negative' ? (
      <TrendingDown className="h-4 w-4" />
    ) : null;
  };

  return (
    <div className={`stat-card-medical-gradient ${colorClasses[color]} animate-slide-in-medical`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              {icon}
            </div>
            <div>
              <h3 className="stat-label-medical">{title}</h3>
              {subtitle && (
                <p className="text-xs opacity-75">{subtitle}</p>
              )}
            </div>
          </div>
          
          <div className="stat-value-medical">{value}</div>
          
          {change && (
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon()}
              <span className="text-sm opacity-90">
                {change.value}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =================================
// CARTE DE PATIENT / TRAVAILLEUR
// =================================

interface PatientCardProps {
  patient: {
    id: string;
    nom: string;
    prenom: string;
    poste?: string;
    derniereVisite?: string;
    statut: 'APTE' | 'INAPTE' | 'ATTENTE' | 'RENOUVELER';
    entreprise?: string;
    avatar?: string;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  compact?: boolean;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onView,
  onEdit,
  compact = false
}) => {
  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'APTE':
        return {
          label: 'Apte',
          className: 'badge-medical-success',
          icon: <CheckCircle className="h-3 w-3" />
        };
      case 'INAPTE':
        return {
          label: 'Inapte',
          className: 'badge-medical-danger',
          icon: <AlertCircle className="h-3 w-3" />
        };
      case 'ATTENTE':
        return {
          label: 'En attente',
          className: 'badge-medical-warning',
          icon: <Clock className="h-3 w-3" />
        };
      case 'RENOUVELER':
        return {
          label: 'À renouveler',
          className: 'badge-medical-warning',
          icon: <Activity className="h-3 w-3" />
        };
      default:
        return {
          label: statut,
          className: 'badge-medical-info',
          icon: <AlertCircle className="h-3 w-3" />
        };
    }
  };

  const statusConfig = getStatusConfig(patient.statut);

  if (compact) {
    return (
      <div className="medical-card p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 gradient-medical-primary rounded-xl flex items-center justify-center text-white font-semibold text-sm">
            {patient.nom.charAt(0)}{patient.prenom.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {patient.nom} {patient.prenom}
            </h3>
            <p className="text-sm text-gray-600 truncate">{patient.poste}</p>
          </div>
          <div className={`badge-medical ${statusConfig.className}`}>
            {statusConfig.icon}
            <span className="ml-1">{statusConfig.label}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="medical-card animate-slide-in-medical">
      <div className="medical-card-header">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 gradient-medical-primary rounded-2xl flex items-center justify-center text-white font-bold shadow-lg">
              {patient.nom.charAt(0)}{patient.prenom.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {patient.nom} {patient.prenom}
              </h3>
              <p className="text-sm text-gray-600">{patient.poste}</p>
              {patient.entreprise && (
                <p className="text-xs text-gray-500">{patient.entreprise}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`badge-medical ${statusConfig.className}`}>
              {statusConfig.icon}
              <span className="ml-1">{statusConfig.label}</span>
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="medical-card-body">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Dernière visite
            </p>
            <p className="text-sm text-gray-900">
              {patient.derniereVisite ? new Date(patient.derniereVisite).toLocaleDateString('fr-FR') : 'Aucune'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              Statut médical
            </p>
            <p className="text-sm text-gray-900">{statusConfig.label}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          {onView && (
            <button
              onClick={() => onView(patient.id)}
              className="btn-medical btn-medical-secondary flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              Voir
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(patient.id)}
              className="btn-medical btn-medical-primary flex-1"
            >
              <Heart className="h-4 w-4 mr-2" />
              Consulter
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =================================
// CARTE DE VISITE MÉDICALE
// =================================

interface VisitCardProps {
  visite: {
    id: string;
    date: string;
    heure?: string;
    type: 'EMBAUCHE' | 'PERIODIQUE' | 'REPRISE' | 'FIN_CONTRAT';
    patient: {
      nom: string;
      prenom: string;
    };
    medecin?: {
      nom: string;
    };
    statut: 'PROGRAMMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
    urgence?: boolean;
  };
  onAction?: (id: string, action: string) => void;
}

export const VisitCard: React.FC<VisitCardProps> = ({ visite, onAction }) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'EMBAUCHE':
        return { label: 'Embauche', color: 'text-blue-600 bg-blue-100' };
      case 'PERIODIQUE':
        return { label: 'Périodique', color: 'text-green-600 bg-green-100' };
      case 'REPRISE':
        return { label: 'Reprise', color: 'text-orange-600 bg-orange-100' };
      case 'FIN_CONTRAT':
        return { label: 'Fin de contrat', color: 'text-purple-600 bg-purple-100' };
      default:
        return { label: type, color: 'text-gray-600 bg-gray-100' };
    }
  };

  const getStatusConfig = (statut: string) => {
    switch (statut) {
      case 'PROGRAMMEE':
        return { label: 'Programmée', className: 'badge-medical-info' };
      case 'EN_COURS':
        return { label: 'En cours', className: 'badge-medical-warning' };
      case 'TERMINEE':
        return { label: 'Terminée', className: 'badge-medical-success' };
      case 'ANNULEE':
        return { label: 'Annulée', className: 'badge-medical-danger' };
      default:
        return { label: statut, className: 'badge-medical-info' };
    }
  };

  const typeConfig = getTypeConfig(visite.type);
  const statusConfig = getStatusConfig(visite.statut);

  return (
    <div className={`medical-card ${visite.urgence ? 'border-l-4 border-red-500' : ''} animate-slide-in-medical`}>
      <div className="medical-card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-medical-success rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {visite.patient.nom} {visite.patient.prenom}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
                  {typeConfig.label}
                </span>
                {visite.urgence && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Urgent
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className={`badge-medical ${statusConfig.className}`}>
            {statusConfig.label}
          </div>
        </div>
      </div>
      
      <div className="medical-card-body">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Date & Heure</span>
            <span className="font-semibold text-gray-900">
              {new Date(visite.date).toLocaleDateString('fr-FR')}
              {visite.heure && ` à ${visite.heure}`}
            </span>
          </div>
          
          {visite.medecin && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Médecin</span>
              <span className="font-semibold text-gray-900">{visite.medecin.nom}</span>
            </div>
          )}
        </div>
        
        {onAction && visite.statut === 'PROGRAMMEE' && (
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => onAction(visite.id, 'commencer')}
              className="btn-medical btn-medical-primary flex-1"
            >
              <Activity className="h-4 w-4 mr-2" />
              Commencer
            </button>
            <button
              onClick={() => onAction(visite.id, 'reporter')}
              className="btn-medical btn-medical-secondary"
            >
              <Clock className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// =================================
// CARTE DE NOTIFICATION
// =================================

interface NotificationCardProps {
  notification: {
    id: string;
    titre: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    date: string;
    lu: boolean;
  };
  onMarkAsRead?: (id: string) => void;
  onAction?: (id: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onAction
}) => {
  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5" />,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
    }
  };

  const typeConfig = getTypeConfig(notification.type);

  return (
    <div className={`medical-card ${!notification.lu ? 'border-l-4 ' + typeConfig.borderColor : ''} animate-slide-in-medical`}>
      <div className="medical-card-body">
        <div className="flex items-start space-x-3">
          <div className={`p-2 rounded-xl ${typeConfig.bgColor}`}>
            <div className={typeConfig.color}>
              {typeConfig.icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className={`font-semibold ${!notification.lu ? 'text-gray-900' : 'text-gray-700'}`}>
                {notification.titre}
              </h3>
              <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                {new Date(notification.date).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <p className={`text-sm mt-1 ${!notification.lu ? 'text-gray-700' : 'text-gray-600'}`}>
              {notification.message}
            </p>
            
            <div className="flex items-center space-x-3 mt-3">
              {!notification.lu && onMarkAsRead && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Marquer comme lu
                </button>
              )}
              {onAction && (
                <button
                  onClick={() => onAction(notification.id)}
                  className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                >
                  Voir détails
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// =================================
// CARTE RÉSUMÉ RAPIDE
// =================================

interface QuickSummaryCardProps {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
    change?: {
      value: string;
      type: 'positive' | 'negative';
    };
  }>;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

export const QuickSummaryCard: React.FC<QuickSummaryCardProps> = ({
  title,
  items,
  icon,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="medical-card animate-slide-in-medical">
      <div className="medical-card-header">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white shadow-lg`}>
            {icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      
      <div className="medical-card-body">
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{item.label}</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{item.value}</span>
                {item.change && (
                  <span className={`text-xs ${
                    item.change.type === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.change.type === 'positive' ? '+' : ''}{item.change.value}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


