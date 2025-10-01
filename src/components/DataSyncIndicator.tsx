import React, { useState, useEffect } from 'react';
import { Database, Check, AlertCircle } from 'lucide-react';

interface DataSyncIndicatorProps {
  medecinsCount: number;
  entreprisesCount: number;
  employeursCount: number;
}

const DataSyncIndicator: React.FC<DataSyncIndicatorProps> = ({ 
  medecinsCount, 
  entreprisesCount, 
  employeursCount 
}) => {
  const stats = {
    medecins: medecinsCount,
    entreprises: entreprisesCount,
    employeurs: employeursCount
  };

  const totalData = stats.medecins + stats.entreprises + stats.employeurs;

  if (totalData === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            Aucune donnée disponible pour les visites
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            Données disponibles pour les visites
          </span>
        </div>
        <Check className="h-4 w-4 text-green-600" />
      </div>
      <div className="mt-2 text-xs text-green-700 space-y-1">
        <div>• {stats.medecins} médecin(s) disponible(s)</div>
        <div>• {stats.entreprises} entreprise(s) enregistrée(s)</div>
        <div>• {stats.employeurs} employeur(s) actif(s)</div>
      </div>
    </div>
  );
};

export default DataSyncIndicator;