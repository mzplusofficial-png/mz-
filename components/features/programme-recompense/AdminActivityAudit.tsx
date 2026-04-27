import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, Loader2, Search, RefreshCw, ChevronDown, ChevronUp, Calendar, 
  Zap, History, UserCheck, Timer, ExternalLink, BarChart3, TrendingUp, 
  Users, Activity, Radio, Globe, ShieldCheck, ArrowUpDown, Award, 
  TrendingDown, LayoutGrid
} from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
// Fix: Added EliteBadge to imports from UI.tsx
import { GoldText, GoldBorderCard, EliteBadge } from '../../UI.tsx';

interface ActivitySummary {
  user_id: string;
  full_name: string;
  email: string;
  user_level: string;
  minutes_today: number;
  minutes_total: number;
  last_active: string | null;
}

interface GlobalStats {
  today: number;
  week: number;
  month: number;
  onlineCount: number;
  totalNetworkUsers: number;
}

type SortKey = 'today' | 'total' | 'name';

export const AdminActivityAudit: React.FC = () => {
  const [data, setData] = useState<ActivitySummary[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ 
    today: 0, 
    week: 0, 
    month: 0, 
    onlineCount: 0,
    totalNetworkUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('today');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userHistory, setUserHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchGlobalStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastWeek = new Date(); lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekStr = lastWeek.toISOString().split('T')[0];
      const lastMonth = new Date(); lastMonth.setDate(lastMonth.getDate() - 30);
      const lastMonthStr = lastMonth.toISOString().split('T')[0];

      const [todayRes, weekRes, monthRes, usersRes] = await Promise.all([
        supabase.from('mz_rewards_time_tracking').select('total_minutes').eq('tracking_date', today),
        supabase.from('mz_rewards_time_tracking').select('total_minutes').gte('tracking_date', lastWeekStr),
        supabase.from('mz_rewards_time_tracking').select('total_minutes').gte('tracking_date', lastMonthStr),
        supabase.from('users').select('id', { count: 'exact', head: true })
      ]);

      const totalToday = (todayRes.data || []).reduce((acc, curr) => acc + (Number(curr.total_minutes) || 0), 0);
      const totalWeek = (weekRes.data || []).reduce((acc, curr) => acc + (Number(curr.total_minutes) || 0), 0);
      const totalMonth = (monthRes.data || []).reduce((acc, curr) => acc + (Number(curr.total_minutes) || 0), 0);

      const fiveMinsAgo = new Date(Date.now() - 300000).toISOString();
      const { count: onlineCount } = await supabase
        .from('mz_rewards_time_tracking')
        .select('*', { count: 'exact', head: true })
        .gte('last_ping', fiveMinsAgo);

      setGlobalStats({
        today: totalToday,
        week: totalWeek,
        month: totalMonth,
        onlineCount: onlineCount || 0,
        totalNetworkUsers: usersRes.count || 0
      });
    } catch (e) {
      console.error("Global Aggregation Error:", e);
    }
  };

  const fetchAudit = async () => {
    setLoading(true);
    try {
      await fetchGlobalStats();
      const { data: audit, error } = await supabase
        .from('mz_admin_activity_summary')
        .select('*');

      if (error) throw error;
      setData(audit || []);
    } catch (e) {
      console.error("Audit Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHistory = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    setLoadingHistory(true);
    try {
      const { data: hist, error } = await supabase
        .from('mz_rewards_time_tracking')
        .select('tracking_date, total_minutes')
        .eq('user_id', userId)
        .order('tracking_date', { ascending: false })
        .limit(14);
      if (error) throw error;
      setUserHistory(hist || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchAudit();
    const interval = setInterval(fetchAudit, 30000); // Rafraîchir toutes les 30s
    return () => clearInterval(interval);
  }, []);

  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter(item => 
      item.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      let valA, valB;
      if (sortKey === 'today') { valA = a.minutes_today; valB = b.minutes_today; }
      else if (sortKey === 'total') { valA = a.minutes_total; valB = b.minutes_total; }
      else { valA = a.full_name; valB = b.full_name; }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, searchTerm, sortKey, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
    return `${m}m`;
  };

  const formatNetworkTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    if (h >= 1000) return `${(h/1000).toFixed(1)}k h`;
    return `${h}h`;
  };

  return (
    <div className="space-y-12 animate-fade-in pb-12 px-2 md:px-0">
      {/* Header Statistique Réseau */}
      <div className="flex flex-col gap-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
              <Globe className="text-blue-500 animate-pulse" /> Audit <GoldText>Performance Réseau</GoldText>
            </h3>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.3em] mt-1 italic">
              Données temps réel de {globalStats.totalNetworkUsers} Ambassadeurs certifiés
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-3 shadow-lg">
                <ShieldCheck size={16} className="text-blue-400" />
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Multi-Protocol Sync v5.5</span>
             </div>
             <button 
                onClick={fetchAudit} 
                className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl text-yellow-600 transition-all border border-white/5 active:scale-90 shadow-2xl"
              >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <GlobalStatCard 
            label="Live Now" 
            value={`${globalStats.onlineCount}`} 
            icon={Radio} 
            color="text-emerald-500" 
            subtitle="Membres en session"
            isPulse
          />
          <GlobalStatCard 
            label="Volume Journée" 
            value={formatTime(globalStats.today)} 
            icon={Zap} 
            color="text-yellow-500" 
            subtitle="Temps cumulé réseau"
          />
          <GlobalStatCard 
            label="Moyenne Hebdo" 
            value={formatNetworkTime(globalStats.week)} 
            icon={TrendingUp} 
            color="text-blue-500" 
            subtitle="Impact 7 derniers jours"
          />
          <GlobalStatCard 
            label="Record Mensuel" 
            value={formatNetworkTime(globalStats.month)} 
            icon={BarChart3} 
            color="text-purple-500" 
            subtitle="Activité 30 jours"
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative group flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-yellow-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Filtrer l'armée d'ambassadeurs..." 
              className="w-full bg-neutral-900/60 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-yellow-600/50 transition-all shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-neutral-900 border border-white/10 p-1.5 rounded-2xl gap-2 w-full md:w-auto">
             <SortButton active={sortKey === 'today'} label="Aujourd'hui" onClick={() => toggleSort('today')} />
             <SortButton active={sortKey === 'total'} label="Total" onClick={() => toggleSort('total')} />
             <SortButton active={sortKey === 'name'} label="Nom" onClick={() => toggleSort('name')} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-32 flex flex-col items-center gap-6 opacity-40">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-20 animate-pulse"></div>
            <Loader2 className="animate-spin text-yellow-500 relative" size={48} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-yellow-500">Agrégation des flux réseau...</p>
        </div>
      ) : filteredAndSortedData.length === 0 ? (
        <div className="py-32 text-center border-2 border-dashed border-white/5 rounded-[4rem] opacity-20">
          <p className="text-sm font-black uppercase tracking-[0.4em]">Aucun Ambassadeur trouvé</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-6 mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-neutral-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600">Ambassadeurs Trackés</span>
            </div>
            <span className="text-[10px] font-black uppercase text-neutral-800">{filteredAndSortedData.length} membres actifs</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedData.map((user, idx) => {
              const isOnline = user.last_active && (Date.now() - new Date(user.last_active).getTime()) < 300000;
              const isExpanded = expandedUser === user.user_id;
              const isTop = idx < 3 && sortKey === 'today' && user.minutes_today > 0;

              return (
                <div key={user.user_id} className={`transition-all duration-500 ${isExpanded ? 'scale-[1.01]' : 'scale-100'}`}>
                  <GoldBorderCard 
                    className={`p-0 overflow-hidden bg-[#0c0c0c] transition-all shadow-2xl relative ${isExpanded ? 'border-yellow-600/30 ring-1 ring-yellow-600/20' : 'border-white/5 hover:border-white/20'} ${isTop ? 'border-yellow-500/10' : ''}`}
                  >
                    {isTop && (
                       <div className="absolute top-0 right-10 bg-yellow-600 text-black px-4 py-1.5 rounded-b-xl text-[8px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl z-20">
                          <Award size={10} /> Top {idx + 1}
                       </div>
                    )}

                      <div 
                        className="p-5 md:p-8 cursor-pointer flex flex-col lg:flex-row items-center justify-between gap-6"
                        onClick={() => fetchUserHistory(user.user_id)}
                      >
                        <div className="flex items-center gap-4 md:gap-5 w-full sm:w-auto">
                          <div className={`relative shrink-0`}>
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.8rem] flex items-center justify-center font-black uppercase text-lg md:text-xl border-2 transition-all duration-700 ${
                              isOnline ? 'bg-yellow-600/10 border-yellow-600/40 text-yellow-600 shadow-[0_0_30px_rgba(202,138,4,0.2)]' : 'bg-neutral-900 border-white/5 text-neutral-600'
                            }`}>
                              {user.full_name?.charAt(0)}
                            </div>
                            {isOnline && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-emerald-500 rounded-full border-4 border-[#0c0c0c] animate-pulse"></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 md:gap-3">
                              <h4 className="text-sm md:text-lg font-black uppercase text-white truncate tracking-tight">{user.full_name}</h4>
                              <EliteBadge variant={user.user_level as any}>{user.user_level === 'niveau_mz_plus' ? 'MZ+' : 'STD'}</EliteBadge>
                            </div>
                            <p className="text-[9px] md:text-[11px] text-neutral-500 font-mono truncate mt-0.5 md:mt-1">{user.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 sm:gap-8 md:gap-16 w-full sm:w-auto pt-5 sm:pt-0 border-t sm:border-t-0 border-white/5">
                          <TimeCell label="Aujourd'hui" value={user.minutes_today} isHighlight={user.minutes_today > 0} color="text-yellow-500" />
                          <TimeCell label="Cumulé" value={user.minutes_total} isHighlight={true} color="text-white" />
                          <div className="text-center sm:text-left flex flex-col justify-center">
                             <p className="text-[8px] font-black uppercase text-neutral-600 tracking-widest mb-1 md:mb-1.5">Statut</p>
                             <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-neutral-800'}`}>
                               {isOnline ? 'Live' : 'Offline'}
                             </p>
                          </div>
                        </div>

                        <div className="hidden sm:flex flex-col items-end min-w-[100px] md:min-w-[120px]">
                           <div className={`p-2 rounded-xl border flex items-center gap-2 ${isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/5 text-neutral-700'}`}>
                             {isOnline ? <Activity size={14} className="animate-bounce" /> : <Clock size={14} />}
                             <span className="text-[9px] font-black uppercase">{isOnline ? 'Live' : 'Offline'}</span>
                           </div>
                           {user.last_active && (
                             <p className="text-[8px] text-neutral-600 font-mono mt-2 tracking-widest uppercase">
                               Signal: {new Date(user.last_active).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </p>
                           )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-black/60 border-t border-white/5 p-6 md:p-12 animate-fade-in relative">
                           <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 md:mb-10">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-600/10 rounded-2xl text-yellow-600">
                                  <History size={20} />
                                </div>
                                <h5 className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] text-white">Rapport d'Activité <GoldText>14 Jours</GoldText></h5>
                              </div>
                              <p className="text-[8px] md:text-[9px] font-black uppercase text-neutral-600 italic">Mise à jour: {new Date().toLocaleTimeString()}</p>
                           </div>

                           {loadingHistory ? (
                             <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-yellow-500" size={32} /></div>
                           ) : userHistory.length === 0 ? (
                             <div className="py-20 text-center opacity-30 italic text-[10px] font-bold uppercase tracking-widest">Zéro donnée historique enregistrée</div>
                           ) : (
                             <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-7 gap-3 md:gap-6 items-end">
                                {userHistory.map((day, idx) => {
                                  const maxMins = Math.max(...userHistory.map(h => h.total_minutes), 1);
                                  const barHeight = Math.max((day.total_minutes / maxMins) * 100, 5);
                                  return (
                                    <div key={idx} className="flex flex-col items-center gap-3 md:gap-4 group/bar">
                                      <div className="w-full bg-white/[0.03] rounded-t-lg md:rounded-t-xl overflow-hidden relative flex flex-col justify-end h-24 md:h-40 border border-white/5 group-hover/bar:border-yellow-600/30 transition-all">
                                         <div 
                                           className={`w-full transition-all duration-1000 ease-out relative ${day.total_minutes > 0 ? 'bg-gradient-to-t from-yellow-700 via-yellow-500 to-yellow-300 shadow-[0_0_20px_rgba(202,138,4,0.1)]' : 'bg-neutral-900'}`}
                                           style={{ height: `${barHeight}%` }}
                                         >
                                            {day.total_minutes > 0 && (
                                              <div className="absolute top-0 inset-x-0 h-1 bg-white/40 blur-[2px]"></div>
                                            )}
                                         </div>
                                         
                                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bar:opacity-100 transition-opacity">
                                            <span className="bg-black/80 px-2 py-1 rounded text-[7px] font-black text-yellow-500 border border-yellow-600/30">{day.total_minutes}m</span>
                                         </div>
                                      </div>
                                      <div className="text-center">
                                        <p className="text-[7px] md:text-[8px] font-black text-neutral-400 uppercase mb-0.5 md:mb-1">
                                          {new Date(day.tracking_date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                                        </p>
                                        <p className={`text-[6px] md:text-[7px] font-black font-mono uppercase tracking-tighter ${day.total_minutes > 0 ? 'text-white' : 'text-neutral-800'}`}>
                                          {new Date(day.tracking_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                                        </p>
                                      </div>
                                    </div>
                                  );
                                })}
                             </div>
                           )}
                           
                           <div className="mt-8 md:mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-8 md:pt-10 border-t border-white/5">
                              <HistoryStat label="Session Moyenne" value={`${Math.round(user.minutes_total / Math.max(userHistory.length, 1))}m`} />
                              <HistoryStat label="Jours Actifs" value={`${userHistory.filter(h => h.total_minutes > 0).length}`} />
                              <HistoryStat label="Max Daily" value={`${Math.max(...userHistory.map(h => h.total_minutes), 0)}m`} />
                           </div>
                        </div>
                      )}
                    </GoldBorderCard>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div className="mt-20 p-10 border-2 border-dashed border-white/5 rounded-[4rem] text-center opacity-30">
        <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
           <LayoutGrid size={24} className="text-neutral-600" />
        </div>
        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.6em] leading-relaxed max-w-sm mx-auto">
          Protocol Audit Neural Sync v5.5 • Multi-Aggregator Verified
        </p>
      </div>
    </div>
  );
};

const TimeCell = ({ label, value, isHighlight, color }: any) => (
  <div className="text-center sm:text-left">
    <p className="text-[8px] font-black uppercase text-neutral-600 tracking-widest mb-1.5">{label}</p>
    <div className="flex items-baseline justify-center sm:justify-start gap-1">
      <span className={`text-xl font-black font-mono leading-none ${isHighlight ? color : 'text-neutral-800'}`}>
        {Math.floor(value / 60)}h {Math.round(value % 60)}m
      </span>
    </div>
  </div>
);

const HistoryStat = ({ label, value }: { label: string; value: string }) => (
  <div className="text-center space-y-1">
     <p className="text-[7px] font-black uppercase text-neutral-600 tracking-[0.3em]">{label}</p>
     <p className="text-lg font-black text-white font-mono tracking-tighter">{value}</p>
  </div>
);

const SortButton = ({ active, label, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
      active ? 'bg-white text-black shadow-2xl scale-105' : 'text-neutral-500 hover:text-white'
    }`}
  >
    {label} <ArrowUpDown size={10} className={active ? 'text-black' : 'text-neutral-700'} />
  </button>
);

const GlobalStatCard = ({ label, value, icon: Icon, color, subtitle, isPulse }: any) => (
  <GoldBorderCard className={`p-6 md:p-8 flex flex-col gap-4 border-white/5 bg-black/40 relative overflow-hidden group shadow-2xl`}>
    {isPulse && (
       <>
         <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
         <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
       </>
    )}
    <div className="flex justify-between items-start">
      <div className={`p-3 bg-white/5 rounded-2xl ${color} shadow-lg border border-white/5`}>
        <Icon size={24} className={isPulse ? 'animate-pulse' : ''} />
      </div>
      <p className="text-[8px] md:text-[10px] font-black uppercase text-neutral-600 tracking-[0.3em]">{label}</p>
    </div>
    <div className="space-y-1">
      <p className={`text-2xl md:text-4xl font-black font-mono text-white tracking-tighter leading-none`}>{value}</p>
      <p className="text-[8px] font-bold uppercase text-neutral-700 tracking-widest mt-2 truncate italic">{subtitle}</p>
    </div>
  </GoldBorderCard>
);
