
import React, { useState, useEffect } from 'react';
import { User, Mail, Key, Hash, AlertTriangle, Loader2, WifiOff, RefreshCw, LogIn, CheckCircle, HelpCircle, Globe } from 'lucide-react';
import { supabase } from '../services/supabase.ts';
import { GoldBorderCard, InputField, PrimaryButton, SelectField } from './UI.tsx';
import { useCurrency } from '../hooks/useCurrency.ts';

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'Afrique du Sud': 'ZAR',
  'Algérie': 'DZD',
  'Angola': 'AOA',
  'Bénin': 'XOF',
  'Botswana': 'BWP',
  'Burkina Faso': 'XOF',
  'Burundi': 'BIF',
  'Cabo Verde': 'CVE',
  'Cameroun': 'XAF',
  'Centrafrique': 'XAF',
  'Comores': 'KMF',
  'Congo-Brazzaville': 'XAF',
  'Côte d\'Ivoire': 'XOF',
  'Djibouti': 'DJF',
  'Égypte': 'EGP',
  'Érythrée': 'ERN',
  'Eswatini': 'SZL',
  'Éthiopie': 'ETB',
  'Gabon': 'XAF',
  'Gambie': 'GMD',
  'Ghana': 'GHS',
  'Guinée (Conakry)': 'GNF',
  'Guinée Équatoriale': 'XAF',
  'Guinée-Bissau': 'XOF',
  'Kenya': 'KES',
  'Lesotho': 'LSL',
  'Libéria': 'LRD',
  'Libye': 'LYD',
  'Madagascar': 'MGA',
  'Malawi': 'MWK',
  'Mali': 'XOF',
  'Maroc': 'MAD',
  'Maurice': 'MUR',
  'Mauritanie': 'MRU',
  'Mozambique': 'MZN',
  'Namibie': 'NAD',
  'Niger': 'XOF',
  'Nigéria': 'NGN',
  'Ouganda': 'UGX',
  'RD Congo': 'CDF',
  'Rwanda': 'RWF',
  'Sénégal': 'XOF',
  'Seychelles': 'SCR',
  'Sierra Leone': 'SLE',
  'Somalie': 'SOS',
  'Soudan': 'SDG',
  'Soudan du Sud': 'SSP',
  'Tanzanie': 'TZS',
  'Tchad': 'XAF',
  'Togo': 'XOF',
  'Tunisie': 'TND',
  'Zambie': 'ZMW',
  'Zimbabwe': 'ZWL',
  // Europe / Autres
  'France': 'EUR',
  'Belgique': 'EUR',
  'Suisse': 'EUR',
  'Canada': 'USD',
  'États-Unis': 'USD',
  'Autre': 'XAF'
};

const COUNTRY_OPTIONS = Object.keys(COUNTRY_CURRENCY_MAP).map(country => ({
  value: country,
  label: country
}));

interface AuthFormProps {
  defaultMode?: 'login' | 'signup';
}

export const AuthForm: React.FC<AuthFormProps> = ({ defaultMode = 'signup' }) => {
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isUserRegistered, setIsUserRegistered] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  
  const { updateCurrency } = useCurrency();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && !isLogin) {
      setReferralCode(ref);
    }
  }, [isLogin]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    
    const currency = COUNTRY_CURRENCY_MAP[selectedCountry];
    if (currency) {
      updateCurrency(currency);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsUserRegistered(false);
    setNeedsConfirmation(false);
    
    // Normalisation rigoureuse
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    if (!isLogin && cleanPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (!isLogin && !country) {
      setError("Veuillez sélectionner votre pays.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password: cleanPassword
        });
        
        if (signInError) {
          // Gérer spécifiquement les erreurs de credentials vs confirmation
          if (signInError.message.toLowerCase().includes('email not confirmed')) {
            setNeedsConfirmation(true);
            throw new Error("Votre email n'est pas encore confirmé. Vérifiez vos spams.");
          }
          if (signInError.message.toLowerCase().includes('invalid login credentials')) {
            throw new Error("Email ou mot de passe incorrect. Vérifiez vos accès.");
          }
          throw signInError;
        }
      } else {
        if (!name.trim()) {
          setError("Le nom complet est requis.");
          setLoading(false);
          return;
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: name.trim(),
              country: country,
              currency: COUNTRY_CURRENCY_MAP[country],
              referral_code_used: referralCode.trim() || null,
            },
          },
        });
        
        if (signUpError) {
          if (signUpError.message.toLowerCase().includes('already registered') || signUpError.message.toLowerCase().includes('already exists')) {
            setIsUserRegistered(true);
            throw new Error("Cet email est déjà lié à un compte MZ+.");
          }
          throw signUpError;
        }
        
        setMessage("Compte créé ! Un email de confirmation a été envoyé (vérifiez vos spams). Vous pourrez vous connecter après avoir cliqué sur le lien.");
        setIsLogin(true);
      }
    } catch (err: any) {
      console.error("Auth System Error:", err);
      setError(err.message || "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setError('');
    setMessage('');
    setIsUserRegistered(false);
    setNeedsConfirmation(false);
  };

  return (
    <GoldBorderCard className="bg-[#0a0a0a] w-full max-w-md mx-auto shadow-2xl shadow-yellow-900/20">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-black mb-1 tracking-tighter text-white">
          <span className="text-yellow-500">
            {isLogin ? 'CONNEXION' : 'INSCRIPTION'}
          </span> MZ+
        </h2>
        <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">
          {isLogin ? 'Accédez à votre dashboard Élite' : 'Rejoignez le cercle des Ambassadeurs'}
        </p>
      </div>

      {error && (
        <div className={`p-4 rounded-xl mb-6 text-xs font-bold leading-relaxed flex items-start gap-3 animate-fade-in border ${
          isUserRegistered || needsConfirmation ? 'bg-blue-900/20 border-blue-500/30 text-blue-300' : 'bg-red-900/20 border-red-500/30 text-red-400'
        }`}>
            {isUserRegistered || needsConfirmation ? <CheckCircle size={16} className="shrink-0" /> : <AlertTriangle size={16} className="shrink-0" />} 
            <div className="flex-1">
              <span>{error}</span>
              {(isUserRegistered || needsConfirmation) && (
                <button 
                  onClick={switchToLogin}
                  className="mt-2 flex items-center gap-2 text-white hover:text-yellow-500 transition-colors uppercase text-[9px] font-black tracking-widest"
                >
                  <LogIn size={10} /> Se connecter maintenant
                </button>
              )}
              {isLogin && !needsConfirmation && (
                <a 
                  href="https://wa.me/237640608183?text=Besoin d'aide pour me connecter à mon compte MZ+"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center gap-2 text-neutral-400 hover:text-white transition-colors uppercase text-[8px] font-black tracking-widest"
                >
                  <HelpCircle size={10} /> Mot de passe oublié ? Contacter le support
                </a>
              )}
            </div>
        </div>
      )}

      {message && (
        <div className="bg-green-900/20 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 text-xs font-bold leading-relaxed animate-fade-in flex items-center gap-3">
            <CheckCircle size={16} className="shrink-0" />
            <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-1">
        {!isLogin && (
          <>
            <InputField icon={User} type="text" placeholder="Nom complet" value={name} onChange={(e: any) => setName(e.target.value)} />
            <SelectField 
              icon={Globe} 
              placeholder="Sélectionnez votre pays" 
              options={COUNTRY_OPTIONS} 
              value={country} 
              onChange={handleCountryChange} 
            />
            <div className="relative">
              <InputField 
                icon={Hash} 
                type="text" 
                placeholder="Code Parrain (Optionnel)" 
                value={referralCode} 
                onChange={(e: any) => setReferralCode(e.target.value)} 
                required={false}
              />
              {referralCode && !isLogin && (
                <div className="absolute right-3 top-3 px-2 py-0.5 bg-yellow-500 text-black text-[8px] font-black rounded uppercase">
                  Parrainage Actif
                </div>
              )}
            </div>
          </>
        )}
        <InputField icon={Mail} type="email" placeholder="Adresse Email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
        <InputField icon={Key} type="password" placeholder="Mot de passe" value={password} onChange={(e: any) => setPassword(e.target.value)} />

        <div className="mt-8">
          <PrimaryButton fullWidth isLoading={loading} type="submit">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : (isLogin ? 'SE CONNECTER' : 'CRÉER MON COMPTE')}
          </PrimaryButton>
        </div>
      </form>

      <div className="mt-6 text-center border-t border-white/5 pt-6">
        <p className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">
          {isLogin ? 'Nouveau ici ?' : 'Déjà membre ?'}
          <button 
            type="button"
            onClick={() => { 
              setIsLogin(!isLogin); 
              setError(''); 
              setMessage(''); 
              setIsUserRegistered(false);
              setNeedsConfirmation(false);
            }}
            className="ml-2 text-yellow-500 font-black hover:text-yellow-400 transition-colors"
          >
            {isLogin ? 'S\'INSCRIRE MAINTENANT' : 'SE CONNECTER'}
          </button>
        </p>
      </div>
    </GoldBorderCard>
  );
};
