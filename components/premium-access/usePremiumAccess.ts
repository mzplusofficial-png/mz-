
import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase.ts';

export interface PremiumAccessConfig {
  is_enabled: boolean;
  reopening_date: string;
}

export const usePremiumAccess = () => {
  const [config, setConfig] = useState<PremiumAccessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('mz_premium_access_config')
          .select('is_enabled, reopening_date')
          .eq('id', 'global-config')
          .single();

        if (error) throw error;
        setConfig(data);
      } catch (err) {
        console.error('Error fetching premium access config:', err);
        // Fallback default
        setConfig({ is_enabled: true, reopening_date: 'Dimanche 17 mars' });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();

    // Real-time subscription
    const subscription = supabase
      .channel('mz_premium_access_config_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'mz_premium_access_config' },
        (payload) => {
          setConfig(payload.new as PremiumAccessConfig);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAccess = (e?: React.MouseEvent | MouseEvent) => {
    if (config && !config.is_enabled) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setIsModalOpen(true);
      return false;
    }
    return true;
  };

  return {
    config,
    loading,
    isModalOpen,
    setIsModalOpen,
    checkAccess
  };
};
