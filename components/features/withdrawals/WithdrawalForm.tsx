import React, { useState } from 'react';
import { XCircle } from 'lucide-react';
import { supabase } from '../../../services/supabase.ts';
import { UserProfile } from '../../../types.ts';
import { GoldBorderCard, GoldText, PrimaryButton } from '../../UI.tsx';
import { useCurrency } from '../../../hooks/useCurrency.ts';
import { CurrencyDisplay } from '../../ui/CurrencyDisplay.tsx';

interface WithdrawalFormProps {
  profile: UserProfile | null;
  balance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ profile, balance, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<string>('Orange Money CI');
  const [account, setAccount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { convertAndFormat, fromCurrency, currency } = useCurrency();

  const MIN_WITHDRAWAL_XAF = 5000;
  const { formatted: minFormatted } = convertAndFormat(MIN_WITHDRAWAL_XAF);
  
  // Calculate XAF amount for validation
  const amountXAF = fromCurrency(amount, currency);

  const paymentMethods = [
    { name: 'Africell CD', desc: 'DR Congo' },
    { name: 'Airtel Money CD', desc: 'DR Congo' },
    { name: 'Airtel Money CG', desc: 'Congo' },
    { name: 'Airtel Money GA', desc: 'Gabon' },
    { name: 'Airtel Money MW', desc: 'Malawi' },
    { name: 'Airtel Money NE', desc: 'Niger' },
    { name: 'Airtel Money RW', desc: 'Rwanda' },
    { name: 'Airtel Money TZ', desc: 'Tanzania' },
    { name: 'Airtel Money UG', desc: 'Uganda' },
    { name: 'Airtel Money ZM', desc: 'Zambia' },
    { name: 'Amanata NE', desc: 'Niger' },
    { name: 'Djamo CI', desc: 'Ivory Coast' },
    { name: 'E-Money SN', desc: 'Senegal' },
    { name: 'EU Mobile CM', desc: 'Cameroon' },
    { name: 'Mixx (ex FreeMoney) SN', desc: 'Senegal' },
    { name: 'HaloPesa TZ', desc: 'Tanzania' },
    { name: 'Moov Money BF', desc: 'Burkina Faso' },
    { name: 'Moov Money BJ', desc: 'Benin' },
    { name: 'Moov Money CI', desc: 'Ivory Coast' },
    { name: 'Moov Money GA', desc: 'Gabon' },
    { name: 'Moov Money ML', desc: 'Mali' },
    { name: 'Moov Money NE', desc: 'Niger' },
    { name: 'Moov Money TG', desc: 'Togo' },
    { name: 'M-Pesa KE', desc: 'Kenya' },
    { name: 'M-Pesa TZ', desc: 'Tanzania' },
    { name: 'MTN MoMo BJ', desc: 'Benin' },
    { name: 'MTN MoMo CG', desc: 'Congo' },
    { name: 'MTN MoMo CI', desc: 'Ivory Coast' },
    { name: 'MTN MoMo CM', desc: 'Cameroon' },
    { name: 'MTN MoMo GN', desc: 'Guinea' },
    { name: 'MTN MoMo LR', desc: 'Liberia' },
    { name: 'MTN MoMo RW', desc: 'Rwanda' },
    { name: 'MTN MoMo UG', desc: 'Uganda' },
    { name: 'MTN MoMo ZM', desc: 'Zambia' },
    { name: 'MyNita NE', desc: 'Niger' },
    { name: 'Orange Money BF', desc: 'Burkina Faso' },
    { name: 'Orange Money CD', desc: 'DR Congo' },
    { name: 'Orange Money CI', desc: 'Ivory Coast' },
    { name: 'Orange Money CM', desc: 'Cameroon' },
    { name: 'Orange Money GN', desc: 'Guinea' },
    { name: 'Orange Money ML', desc: 'Mali' },
    { name: 'Orange Money SN', desc: 'Senegal' },
    { name: 'Mixx (ex-Tigo) TZ', desc: 'Tanzania' },
    { name: 'TNM MW', desc: 'Malawi' },
    { name: 'Mixx (ex Togocel)', desc: 'Togo' },
    { name: 'Vodacom CD', desc: 'DR Congo' },
    { name: 'Wave BF', desc: 'Burkina Faso' },
    { name: 'Wave CI', desc: 'Ivory Coast' },
    { name: 'Wave SN', desc: 'Senegal' },
    { name: 'Zamtel ZM', desc: 'Zambia' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountXAF < MIN_WITHDRAWAL_XAF) {
      alert(`Le montant minimum de retrait est de ${minFormatted}.`);
      return;
    }
    if (amountXAF > balance) {
      alert("Solde insuffisant.");
      return;
    }
    if (!account) {
      alert("Veuillez saisir votre numéro de compte.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('withdrawals').insert([{
        user_id: profile?.id,
        amount: amountXAF, // Always store in XAF base currency
        method,
        account,
        status: 'pending'
      }]);

      if (error) throw error;
      alert("Demande de retrait envoyée avec succès !");
      onSuccess();
    } catch (error: any) {
      alert("Erreur lors de la demande : " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={onClose}></div>
      <GoldBorderCard className="relative w-full max-w-xl bg-[#080808] border-white/10 p-8 shadow-2xl animate-slide-down">
         <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">Demande de <GoldText>Retrait</GoldText></h3>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
              <XCircle size={24} />
            </button>
         </div>

         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Montant (Min. {minFormatted})</label>
              <div className="relative">
                <input 
                  required 
                  type="number" 
                  step="any"
                  className="w-full bg-black border border-white/10 rounded-xl p-4 pr-16 text-sm text-white focus:border-yellow-600/50 transition-colors" 
                  placeholder={`Ex: ${convertAndFormat(10000).converted.toFixed(0)}`} 
                  value={amount || ''} 
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)} 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-yellow-600 uppercase">
                  {currency}
                </div>
              </div>
              {amount > 0 && !currency.includes('XAF') && (
                <p className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">
                  Valeur estimée : <span className="text-neutral-400">{amountXAF.toLocaleString()} FCFA</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Méthode de Paiement</label>
              <select 
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:border-yellow-600/50 transition-colors"
                value={method}
                onChange={e => setMethod(e.target.value)}
              >
                {paymentMethods.map((pm) => (
                  <option key={pm.name} value={pm.name}>
                    {pm.name} ({pm.desc})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Numéro de Téléphone / Compte</label>
              <input 
                required 
                type="text" 
                className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:border-yellow-600/50 transition-colors" 
                placeholder="Ex: 0707070707" 
                value={account} 
                onChange={e => setAccount(e.target.value)} 
              />
            </div>

            <div className="pt-4">
              <PrimaryButton type="submit" fullWidth isLoading={isSubmitting}>
                Confirmer la demande
              </PrimaryButton>
            </div>
         </form>
      </GoldBorderCard>
    </div>
  );
};
