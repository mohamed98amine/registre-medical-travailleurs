import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface NotificationData {
  type: 'demande_affiliation_updated';
  demandeId: number;
  newStatus: string;
  message: string;
}

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    // Simuler des notifications en temps réel
    // Dans un vrai projet, vous utiliseriez WebSockets ou Server-Sent Events
    const interval = setInterval(() => {
      // Vérifier les changements de statut des demandes
      queryClient.invalidateQueries({ queryKey: ['mes-demandes-affiliation'] });
      queryClient.invalidateQueries({ queryKey: ['demandes-affiliation'] });
    }, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [queryClient]);

  const addNotification = (notification: NotificationData) => {
    setNotifications(prev => [...prev, notification]);
    
    // Afficher une toast notification
    if (notification.type === 'demande_affiliation_updated') {
      const statusMessages = {
        'VALIDEE': 'Votre demande d\'affiliation a été validée !',
        'REJETEE': 'Votre demande d\'affiliation a été rejetée.',
        'EN_COURS': 'Votre demande d\'affiliation est en cours d\'examen.'
      };
      
      const message = statusMessages[notification.newStatus as keyof typeof statusMessages] || notification.message;
      
      if (notification.newStatus === 'VALIDEE') {
        toast.success(message, { duration: 5000 });
      } else if (notification.newStatus === 'REJETEE') {
        toast.error(message, { duration: 5000 });
      } else {
        toast(message, { icon: 'ℹ️', duration: 4000 });
      }
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    clearNotifications
  };
};








