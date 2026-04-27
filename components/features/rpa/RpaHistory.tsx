
import React from 'react';
import { CheckCircle2, Clock, XCircle, ArrowUpRight } from 'lucide-react';

interface RpaHistoryProps {
  submissions: any[];
}

export const RpaHistory: React.FC<RpaHistoryProps> = ({ submissions }) => {
  if (submissions.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-3 text-neutral-700">
        <div className="h-px w-8 bg-white/5"></div>
        <h4 className="text-[8px] font-black uppercase tracking-[0.3em]">Mes vidéos soumises</h4>
        <div className="h-px w-8 bg-white/5"></div>
      </div>
      
      <div className="space-y-3">
        {submissions.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between p-5 bg-white/[0.01] border border-white/5 rounded-[1.5rem] hover:bg-white/[0.03] transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                sub.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                sub.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
                'bg-blue-500/10 border-blue-500/20 text-blue-500'
              }`}>
                {sub.status === 'approved' ? <CheckCircle2 size={18}/> : 
                 sub.status === 'rejected' ? <XCircle size={18}/> : 
                 <Clock size={18} className="animate-pulse" />}
              </div>
              
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase text-white tracking-tight">Vidéo MZ+</p>
                <div className="flex items-center gap-3 mt-1">
                   <a href={sub.data?.link} target="_blank" rel="noreferrer" className="text-[8px] font-bold text-neutral-600 hover:text-yellow-600 flex items-center gap-1">
                      Voir le lien <ArrowUpRight size={8} />
                   </a>
                   <p className="text-[7px] text-neutral-700 font-mono">
                     {new Date(sub.created_at).toLocaleDateString()}
                   </p>
                </div>
              </div>
            </div>
            
            <div className="text-right flex flex-col items-end gap-1">
               <p className={`text-[10px] font-black font-mono ${sub.points_awarded > 0 ? 'text-yellow-500' : 'text-neutral-800'}`}>
                 {sub.points_awarded > 0 ? `+${sub.points_awarded}` : '0'}
               </p>
               <span className={`text-[6px] font-black uppercase tracking-widest ${
                 sub.status === 'approved' ? 'text-emerald-500' : 
                 sub.status === 'rejected' ? 'text-red-500' : 
                 'text-blue-500'
               }`}>
                 {sub.status === 'approved' ? 'Payé' : 
                  sub.status === 'rejected' ? 'Refusé' : 
                  'Vérification'}
               </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
