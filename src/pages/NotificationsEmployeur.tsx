import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  statut: string;
  demande_id: number;
  created_at: string;
}

const NotificationsEmployeur: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const employeurEmail = 'employeur@test.com'; // Email employeur par défaut
      const response = await fetch(`http://localhost:8080/api/consultations/notifications/${encodeURIComponent(employeurEmail)}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'ACCEPTEE': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REFUSEE': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'TERMINEE': return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'ACCEPTEE': return 'border-l-green-500 bg-green-50';
      case 'REFUSEE': return 'border-l-red-500 bg-red-50';
      case 'TERMINEE': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-yellow-500 bg-yellow-50';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Bell className="w-8 h-8 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Mes Notifications</h1>
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-500">Vous n'avez pas encore de notifications.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow border-l-4 p-4 ${getStatusColor(notification.statut)}`}
              >
                <div className="flex items-start space-x-3">
                  {getStatusIcon(notification.statut)}
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Demande #{notification.demande_id} • {new Date(notification.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsEmployeur;