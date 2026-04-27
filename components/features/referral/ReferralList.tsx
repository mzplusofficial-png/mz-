
import React from 'react';
import { User, Shield, Star, Clock, UserCheck } from 'lucide-react';
import { ReferralCard } from './ReferralCard.tsx';

interface Member {
  id: string;
  full_name: string;
  user_level: string;
  created_at: string;
}

interface Props {
  members: Member[];
}

export const ReferralList: React.FC<Props> = ({ members }) => {
  return (
    <div id="referral-list-container">
      <ReferralCard className="p-0 overflow-hidden bg-[#080808]">
        <div className="p-6 border-b border-white/5 bg-black/20 flex items-center justify-between">
           <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-3">
             <UserCheck size={16} className="text-yellow-600" /> Journal du Parrainage
           </h4>
           <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{members.length} Filleuls</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-white/5">
                <th className="p-6 tracking-widest">Identité du Filleul</th>
                <th className="p-6 tracking-widest">Status Niveau</th>
                <th className="p-6 text-right tracking-widest">Date de Parrainage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-20 text-center">
                     <div className="flex flex-col items-center gap-4 opacity-20">
                        <Shield size={48} strokeWidth={1} className="text-yellow-600" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">En attente de nouveaux parrainages</p>
                     </div>
                  </td>
                </tr>
              ) : (
                members.map((u) => (
                  <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/5 flex items-center justify-center text-white font-black uppercase shadow-lg group-hover:scale-110 group-hover:border-yellow-600/30 transition-all">
                           {u.full_name?.charAt(0)}
                         </div>
                         <span className="font-black uppercase text-white tracking-tight">{u.full_name}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${
                        u.user_level === 'niveau_mz_plus' 
                          ? 'bg-purple-900/20 border-purple-500/30 text-purple-400' 
                          : 'bg-white/5 border-white/10 text-neutral-500'
                      }`}>
                        {u.user_level === 'niveau_mz_plus' ? <Star size={10} fill="currentColor" /> : <Shield size={10} />}
                        {u.user_level === 'niveau_mz_plus' ? 'MZ+ Premium' : 'Standard'}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 text-neutral-500 font-mono text-[10px]">
                         <Clock size={12} />
                         {new Date(u.created_at).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ReferralCard>
    </div>
  );
};
