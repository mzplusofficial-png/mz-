import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, Users, Clock, Timer, Eye, Filter, RefreshCw, 
  ChevronRight, Calendar, User, Search, TrendingUp, AlertCircle,
  Activity, MousePointer2, Info, ArrowUpRight, Flame
} from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { GoldBorderCard, GoldText, EliteBadge } from '../../UI.tsx';

export const UserBehaviorAdmin: React.FC = () => {
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');

  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mz_offer_page_tracking')
        .select(`
          *,
          users:user_id(full_name, email, user_level)
        `)
        .order('last_ping', { ascending: false })
        .limit(500);

      if (error) throw error;
      setTrackingData(data || []);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(fetchTracking, 15000); // Rafraîchir toutes les 15s
    return () => clearInterval(interval);
  }, []);

  const filteredDataByPeriod = useMemo(() => {
    if (filterPeriod === 'all') return trackingData;
    
    const now = new Date();
    const limitDate = new Date();
    limitDate.setHours(0, 0, 0, 0);
    
    if (filterPeriod === 'yesterday') {
      const yesterdayStart = new Date(limitDate);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const yesterdayEnd = new Date(limitDate);
      
      return trackingData.filter(t => {
        const trackDate = new Date(t.started_at);
        return trackDate >= yesterdayStart && trackDate < yesterdayEnd;
      });
    }

    if (filterPeriod === 'week') {
      limitDate.setDate(now.getDate() - 7);
    }
    
    return trackingData.filter(t => {
      const trackDate = new Date(t.started_at);
      return trackDate >= limitDate;
    });
  }, [trackingData, filterPeriod]);

  const stats = useMemo(() => {
    const data = filteredDataByPeriod;
    const uniqueVisitors = new Set(data.map(t => t.user_id)).size;
    const totalVisits = data.length;
    const avgSeconds = data.length > 0 
      ? data.reduce((acc, t) => acc + t.duration_seconds, 0) / data.length 
      : 0;
    
    // Visites > 2 minutes (Engagés)
    const hotLeads = data.filter(t => t.duration_seconds >= 120).length;

    // Calcul des tendances si on est sur "Aujourd'hui"
    let trends = null;
    if (filterPeriod === 'today') {
      const limitDate = new Date();
      limitDate.setHours(0, 0, 0, 0);
      const yesterdayStart = new Date(limitDate);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      
      const yesterdayData = trackingData.filter(t => {
        const d = new Date(t.started_at);
        return d >= yesterdayStart && d < limitDate;
      });

      const yUnique = new Set(yesterdayData.map(t => t.user_id)).size;
      const yVisits = yesterdayData.length;
      
      trends = {
        visitors: yUnique > 0 ? ((uniqueVisitors - yUnique) / yUnique) * 100 : 0,
        sessions: yVisits > 0 ? ((totalVisits - yVisits) / yVisits) * 100 : 0
      };
    }

    return { uniqueVisitors, totalVisits, avgSeconds, hotLeads, trends };
  }, [filteredDataByPeriod, filterPeriod, trackingData]);

  const filteredList = useMemo(() => {
    return filteredDataByPeriod.filter(item => 
      item.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredDataByPeriod, searchTerm]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* HEADER & GLOBAL STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2 md:px-0">
        <div>
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
             <MousePointer2 className="text-emerald-500" /> Analyse <GoldText>Comportement Offre</GoldText>
          </h3>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">Audit du tunnel de conversion en temps réel</p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[8px] text-neutral-500 font-black uppercase tracking-widest">Dernière mise à jour</p>
            <p className="text-[10px] text-emerald-500 font-mono">{lastRefresh.toLocaleTimeString()}</p>
          </div>
          <button onClick={fetchTracking} className="w-full md:w-auto flex items-center justify-center p-4 md:p-3 bg-white/5 hover:bg-white/10 rounded-xl text-yellow-600 border border-white/5 transition-all">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2 md:px-0">
        <BehaviorStatCard 
          label="Visiteurs Uniques" 
          value={stats.uniqueVisitors} 
          icon={Users} 
          color="text-blue-400" 
          trend={stats.trends?.visitors}
        />
        <BehaviorStatCard 
          label="Sessions Totales" 
          value={stats.totalVisits} 
          icon={Activity} 
          color="text-purple-400" 
          trend={stats.trends?.sessions}
        />
        <BehaviorStatCard label="Temps Moyen" value={formatDuration(Math.round(stats.avgSeconds))} icon={Timer} color="text-yellow-500" />
        <BehaviorStatCard label="Prospects Chauds" value={stats.hotLeads} icon={Flame} color="text-orange-500" subtitle="> 2 mins d'attention" />
      </div>

      {/* ENGAGEMENT ANALYSIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2 md:px-0">
        <div className="lg:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-black uppercase tracking-widest text-white">Répartition de l'Engagement</h4>
            <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Passifs
              <div className="w-2 h-2 rounded-full bg-orange-500 ml-2"></div> Engagés
            </div>
          </div>
          
          <div className="relative h-4 bg-white/5 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-emerald-500 transition-all duration-1000" 
              style={{ width: `${stats.totalVisits > 0 ? ((stats.totalVisits - stats.hotLeads) / stats.totalVisits) * 100 : 0}%` }}
            />
            <div 
              className="h-full bg-orange-500 transition-all duration-1000 shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
              style={{ width: `${stats.totalVisits > 0 ? (stats.hotLeads / stats.totalVisits) * 100 : 0}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Visiteurs Passifs</p>
              <p className="text-xl font-black text-white">{stats.totalVisits - stats.hotLeads} <span className="text-[10px] text-neutral-600 ml-1">({stats.totalVisits > 0 ? Math.round(((stats.totalVisits - stats.hotLeads) / stats.totalVisits) * 100) : 0}%)</span></p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Prospects Engagés</p>
              <p className="text-xl font-black text-orange-500">{stats.hotLeads} <span className="text-[10px] text-neutral-600 ml-1">({stats.totalVisits > 0 ? Math.round((stats.hotLeads / stats.totalVisits) * 100) : 0}%)</span></p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-600/5 border border-emerald-500/20 rounded-[2.5rem] p-8 flex flex-col justify-center text-center space-y-4">
          <TrendingUp className="text-emerald-500 mx-auto" size={32} />
          <div>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Taux de Rétention</p>
            <p className="text-4xl font-black text-white">{stats.totalVisits > 0 ? Math.round((stats.hotLeads / stats.totalVisits) * 100) : 0}%</p>
          </div>
          <p className="text-[9px] text-neutral-500 font-bold uppercase leading-relaxed">
            Pourcentage de visiteurs qui restent plus de 2 minutes sur votre offre.
          </p>
        </div>
      </div>

      {/* FILTERS & LOG */}
      <div className="space-y-6 px-2 md:px-0">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
            <input 
              placeholder="Rechercher un prospect..." 
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white outline-none focus:border-emerald-500/40"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-[#0a0a0a] border border-white/5 p-1 rounded-2xl w-full md:w-auto">
             <button onClick={() => setFilterPeriod('today')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${filterPeriod === 'today' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500'}`}>Aujourd'hui</button>
             <button onClick={() => setFilterPeriod('yesterday')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${filterPeriod === 'yesterday' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500'}`}>Hier</button>
             <button onClick={() => setFilterPeriod('week')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${filterPeriod === 'week' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500'}`}>7 Jours</button>
             <button onClick={() => setFilterPeriod('all')} className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${filterPeriod === 'all' ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-500'}`}>Tout</button>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden">
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden p-4">
            {loading && trackingData.length === 0 ? (
              <div className="p-10 text-center opacity-30 uppercase font-black text-[10px]">Chargement...</div>
            ) : filteredList.length === 0 ? (
              <div className="p-10 text-center opacity-30 uppercase font-black text-[10px]">Aucune visite</div>
            ) : (
              filteredList.map((track) => {
                const isHot = track.duration_seconds >= 120;
                const isLive = (Date.now() - new Date(track.last_ping).getTime()) < 30000;
                
                return (
                  <div key={track.id} className="p-5 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-black uppercase text-xs border border-white/5">
                          {track.users?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-black uppercase text-white text-xs tracking-tight">{track.users?.full_name || 'Inconnu'}</p>
                          <p className="text-[8px] text-neutral-600 font-mono">{track.users?.email}</p>
                        </div>
                      </div>
                      {isLive ? (
                        <div className="px-2 py-0.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 text-[7px] font-black uppercase rounded animate-pulse">EN DIRECT</div>
                      ) : isHot ? (
                        <div className="px-2 py-0.5 bg-orange-600/10 border border-orange-500/20 text-orange-500 text-[7px] font-black uppercase rounded">CHAUD</div>
                      ) : (
                        <div className="px-2 py-0.5 bg-neutral-800 text-neutral-600 text-[7px] font-black uppercase rounded">Passé</div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                      <div>
                        <p className="text-[8px] font-black uppercase text-neutral-500 mb-1">Visite</p>
                        <p className="text-[10px] font-bold text-white">{new Date(track.started_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-black uppercase text-neutral-500 mb-1">Durée</p>
                        <p className="text-[10px] font-black text-emerald-500 font-mono">{formatDuration(track.duration_seconds)}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <p className="text-[8px] font-black uppercase text-neutral-500">Attention</p>
                        <p className="text-[8px] font-black text-white">{Math.min(Math.round((track.duration_seconds / 300) * 100), 100)}%</p>
                      </div>
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${isHot ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min((track.duration_seconds / 300) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
                <tr>
                  <th className="p-6">Ambassadeur</th>
                  <th className="p-6">Heure de Visite</th>
                  <th className="p-6">Durée Passée</th>
                  <th className="p-6">Attention</th>
                  <th className="p-6 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {loading && trackingData.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center opacity-30 uppercase font-black">Chargement des données...</td></tr>
                ) : filteredList.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center opacity-30 uppercase font-black">Aucune visite enregistrée</td></tr>
                ) : (
                  filteredList.map((track) => {
                    const isHot = track.duration_seconds >= 120;
                    const isLive = (Date.now() - new Date(track.last_ping).getTime()) < 30000;
                    
                    return (
                      <tr key={track.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="p-6">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-white font-black uppercase text-xs border border-white/5">
                                {track.users?.full_name?.charAt(0) || '?'}
                              </div>
                              <div>
                                 <p className="font-black uppercase text-white tracking-tight">{track.users?.full_name || 'Inconnu'}</p>
                                 <p className="text-[8px] text-neutral-600 font-mono">{track.users?.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex flex-col">
                              <span className="text-white font-bold">{new Date(track.started_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              <span className="text-[8px] text-neutral-600 uppercase mt-0.5">{new Date(track.started_at).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                              <Clock size={12} className="text-emerald-500" />
                              <span className="font-mono font-black text-white text-sm">{formatDuration(track.duration_seconds)}</span>
                           </div>
                        </td>
                        <td className="p-6">
                           <div className="w-32 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-1000 ${isHot ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min((track.duration_seconds / 300) * 100, 100)}%` }}
                              />
                           </div>
                        </td>
                        <td className="p-6 text-right">
                           <div className="flex justify-end items-center gap-2">
                              {isLive ? (
                                <div className="px-2 py-0.5 bg-emerald-600/10 border border-emerald-500/20 text-emerald-500 text-[7px] font-black uppercase rounded animate-pulse">EN DIRECT</div>
                              ) : isHot ? (
                                <div className="px-2 py-0.5 bg-orange-600/10 border border-orange-500/20 text-orange-500 text-[7px] font-black uppercase rounded">CHAUD</div>
                              ) : (
                                <div className="px-2 py-0.5 bg-neutral-800 text-neutral-600 text-[7px] font-black uppercase rounded">Passé</div>
                              )}
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[2.5rem] flex items-start gap-4">
           <Info className="text-blue-400 shrink-0" size={24} />
           <p className="text-[10px] text-neutral-400 font-medium leading-relaxed italic uppercase">
             <strong>Note stratégique :</strong> Les utilisateurs restant plus de 2 minutes sur la page offre sont considérés comme des "Prospects Chauds". 
             Vous pouvez les contacter via la messagerie privée pour les aider à finaliser leur upgrade.
           </p>
        </div>
      </div>
    </div>
  );
};

const BehaviorStatCard = ({ label, value, icon: Icon, color, subtitle, trend }: any) => (
  <GoldBorderCard className="p-6 bg-[#0c0c0c] border-white/5 hover:border-emerald-500/20 transition-all flex flex-col gap-4">
     <div className="flex justify-between items-start">
        <div className={`p-3 rounded-2xl bg-white/5 ${color} shadow-lg`}>
           <Icon size={24} />
        </div>
        <div className="text-right">
          <p className="text-[8px] font-black uppercase text-neutral-600 tracking-[0.3em]">{label}</p>
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center justify-end gap-1 mt-1 ${trend > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {trend > 0 ? <ArrowUpRight size={10} /> : <TrendingUp size={10} className="rotate-180" />}
              <span className="text-[9px] font-black">{trend > 0 ? '+' : ''}{Math.round(trend)}%</span>
            </div>
          )}
        </div>
     </div>
     <div>
        <p className="text-2xl font-black font-mono text-white tracking-tighter leading-none">{value}</p>
        {subtitle && <p className="text-[7px] font-bold text-neutral-600 uppercase mt-2 tracking-widest">{subtitle}</p>}
     </div>
  </GoldBorderCard>
);