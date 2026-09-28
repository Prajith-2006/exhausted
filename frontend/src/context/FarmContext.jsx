import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const FarmContext = createContext();

export const FarmProvider = ({ children }) => {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [loadingFarms, setLoadingFarms] = useState(false);

  const fetchFarms = async () => {
    if (!user) return;
    setLoadingFarms(true);
    try {
      const data = await api.getFarms();
      setFarms(data);
      if (data.length > 0 && !selectedFarm) {
        setSelectedFarm(data[0]);
      } else if (data.length > 0 && selectedFarm) {
        // Keep updated farm instance
        const updated = data.find(f => f._id === selectedFarm._id);
        if (updated) setSelectedFarm(updated);
        else setSelectedFarm(data[0]);
      }
    } catch (err) {
      console.error('Error fetching farms:', err.message);
    } finally {
      setLoadingFarms(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFarms();
    } else {
      setFarms([]);
      setSelectedFarm(null);
    }
  }, [user]);

  return (
    <FarmContext.Provider value={{ farms, selectedFarm, setSelectedFarm, fetchFarms, loadingFarms }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => useContext(FarmContext);
