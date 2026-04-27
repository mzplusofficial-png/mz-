import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ShoppingBag as Bag,
  ShoppingBag, 
  Globe as Web, 
  Clock, 
  Target,
  History as Hist, 
  XCircle, 
  CheckCircle as Check, 
  Copy as CopyIcon, 
  Search,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  X,
  Crown,
  Sparkles,
  Edit3,
  Trash2,
  Zap,
  ArrowUpRight,
  Share2,
  BookOpen,
  RefreshCw,
  Coins,
  GraduationCap,
  Plus,
  Loader2,
  Calendar,
  MousePointer2 as Cursor,
  Activity,
  AlertCircle,
  Layers,
  Check as CheckIcon,
  X as XIcon,
  User,
  Image as ImageIcon,
  Save,
  ExternalLink,
  ArrowLeft,
  Shield,
  ArrowRight,
  ChevronDown,
  Bell,
  Megaphone,
  Home,
  Smartphone,
  Star,
  Facebook,
  Mail,
  MessageCircle,
  Link as LinkIcon,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../services/supabase.ts';
import { Product, Commission, UserProfile, ProductStat, TabId } from '../types.ts';
import { GoldBorderCard, PrimaryButton, SectionTitle, GoldText } from './UI.tsx';
import { CurrencyDisplay } from './ui/CurrencyDisplay.tsx';

interface AffiliationSystemProps {
  profile: UserProfile | null;
  isAdminView?: boolean;
  lastUpdateSignal?: number;
  showValidations?: boolean;
  showCatalog?: boolean;
  onSwitchTab?: (tab: TabId) => void;
  onlyCatalog?: boolean;
}

export const AffiliationSystem: React.FC<AffiliationSystemProps> = ({ 
  profile, 
  isAdminView = false, 
  lastUpdateSignal,
  showValidations = true,
  showCatalog = true,
  onSwitchTab,
  onlyCatalog = false
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isCatalogVisible, setIsCatalogVisible] = useState(onlyCatalog);
  const [activeCatalogFilter, setActiveCatalogFilter] = useState<'all' | 'popular' | 'sellers' | 'recommended'>('all');
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleDetail = (e: any) => setSelectedProductForDetail(e.detail);
    window.addEventListener('show_product_detail', handleDetail);
    return () => window.removeEventListener('show_product_detail', handleDetail);
  }, []);

  const scrollToProducts = () => {
    setIsCatalogVisible(true);
    // Use a small timeout to allow the DOM to update before scrolling
    setTimeout(() => {
      if (productsRef.current) {
        productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  // États Admin Produit
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: 0,
    commission_amount: 0,
    image_url: '',
    final_link: ''
  });

  const fetchData = useCallback(async (retryCount = 0) => {
    try {
      setError(null);
      if (retryCount === 0) setLoading(true);

      const { data: prods, error: prodsError } = await supabase.from('products').select('*');
      
      if (prodsError) throw prodsError;
      
      setProducts(prods || []);

      if (isAdminView) {
        const { data: comms, error: commsError } = await supabase
          .from('commissions')
          .select(`*, products(*), users:user_id(full_name, email)`)
          .order('created_at', { ascending: false });
        if (commsError) throw commsError;
        setCommissions(comms || []);
      } else if (profile?.id) {
        const [commsRes, statsRes] = await Promise.all([
          supabase.from('commissions').select('*, products(*)').eq('user_id', profile.id).order('created_at', { ascending: false }),
          supabase.from('product_stats').select('product_id, clicks').eq('user_id', profile.id)
        ]);
        
        if (commsRes.error) throw commsRes.error;
        if (statsRes.error) throw statsRes.error;
        
        setCommissions(commsRes.data || []);
        setProductStats(statsRes.data || []);
      }
    } catch (e: any) { 
      console.error("Affiliation Fetch Error:", e);
      if (retryCount < 3 && (e.message?.includes('fetch') || e.name === 'TypeError')) {
        const delay = 1000 * (retryCount + 1);
        console.log(`Retrying affiliation fetch in ${delay}ms...`);
        setTimeout(() => fetchData(retryCount + 1), delay);
        return;
      }
      setError("Erreur de connexion. Veuillez vérifier votre réseau.");
      setProducts([]);
    } finally { 
      setLoading(false); 
    }
  }, [isAdminView, profile?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData, lastUpdateSignal]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setProcessingId(id);
    try {
      const { error } = await supabase.from('commissions').update({ status }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (e: any) { alert("Erreur validation : " + e.message); } finally { setProcessingId(null); }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProduct(true);
    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(productFormData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productFormData]);
        if (error) throw error;
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setProductFormData({ name: '', description: '', price: 0, commission_amount: 0, image_url: '', final_link: '' });
      fetchData();
    } catch (err: any) { alert(err.message); } finally { setIsSavingProduct(false); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit du catalogue ?")) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err: any) { alert(err.message); }
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      commission_amount: product.commission_amount || 0,
      image_url: product.image_url || '',
      final_link: product.final_link || ''
    });
    setShowProductForm(true);
  }  // --- RENDU ADMIN : GESTION DES VENTES ---
  if (isAdminView && showValidations) {
    const pending = commissions.filter(c => c.status === 'pending');
    const history = commissions.filter(c => c.status !== 'pending');
    
    const totalVolume = commissions.filter(c => c.status === 'approved').reduce((acc, c) => acc + c.amount, 0);

    return (
      <div className="space-y-10 animate-fade-in">
        {/* Résumé des Ventes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-2">
          <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[2rem] space-y-2">
            <p className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">Volume Total</p>
            <CurrencyDisplay 
              amount={totalVolume} 
              className="text-xl font-black text-yellow-500 font-mono"
              secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
            />
          </div>
          <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[2rem] space-y-2">
            <p className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">Ventes Approuvées</p>
            <p className="text-xl font-black text-white font-mono">{commissions.filter(c => c.status === 'approved').length}</p>
          </div>
          <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[2rem] space-y-2">
            <p className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">En attente</p>
            <p className="text-xl font-black text-orange-500 font-mono">{pending.length}</p>
          </div>
          <div className="p-6 bg-[#0a0a0a] border border-white/5 rounded-[2rem] space-y-2">
            <p className="text-[8px] font-black uppercase text-neutral-500 tracking-widest">Taux de Validation</p>
            <p className="text-xl font-black text-emerald-500 font-mono">
              {commissions.length > 0 ? Math.round((commissions.filter(c => c.status === 'approved').length / commissions.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Ventes en attente */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase text-orange-500 flex items-center gap-3 px-2"><AlertCircle size={20} /> Ventes à valider</h3>
          
          {/* Mobile View */}
          <div className="grid grid-cols-1 gap-4 md:hidden px-2">
            {pending.length === 0 ? (
              <div className="p-10 text-center opacity-30 text-[10px] uppercase border border-dashed border-white/10 rounded-2xl">Aucune vente en attente</div>
            ) : (
              pending.map(c => (
                <div key={c.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black uppercase text-sm">{(c as any).users?.full_name || 'Inconnu'}</div>
                      <div className="text-[10px] font-bold text-neutral-300 mt-1">{c.products?.name}</div>
                    </div>
                    <div className="font-mono text-yellow-500 text-xs font-black">
                      <CurrencyDisplay 
                        amount={c.amount} 
                        className="font-mono text-yellow-500 text-xs font-black"
                        secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                      />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[8px] text-neutral-600 font-mono">{new Date(c.created_at).toLocaleString()}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdateStatus(c.id, 'rejected')} className="p-2.5 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl"><XIcon size={16}/></button>
                      <button onClick={() => handleUpdateStatus(c.id, 'approved')} className="p-2.5 bg-emerald-600 rounded-xl"><CheckIcon size={16}/></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
             <table className="w-full text-left text-xs">
                <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
                  <tr>
                    <th className="p-6">Date</th>
                    <th className="p-6">Ambassadeur</th>
                    <th className="p-6">Produit</th>
                    <th className="p-6">Commission</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {pending.length === 0 ? (<tr><td colSpan={5} className="p-20 text-center opacity-30 text-[10px] uppercase">Aucune vente en attente</td></tr>) : 
                    pending.map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-6 text-neutral-500 font-mono">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="p-6"><div className="font-black uppercase">{(c as any).users?.full_name || 'Inconnu'}</div></td>
                        <td className="p-6 font-bold text-neutral-300">{c.products?.name}</td>
                        <td className="p-6 font-mono text-yellow-500">
                          <CurrencyDisplay 
                            amount={c.amount} 
                            className="font-mono text-yellow-500"
                            secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                          />
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleUpdateStatus(c.id, 'rejected')} className="p-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white transition-all"><XIcon size={16}/></button>
                            <button onClick={() => handleUpdateStatus(c.id, 'approved')} className="p-2 bg-emerald-600 rounded-xl hover:scale-105 transition-all"><CheckIcon size={16}/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
             </table>
          </div>
        </div>

        {/* Historique des Ventes */}
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase text-neutral-500 flex items-center gap-3 px-2"><Hist size={20} /> Historique des ventes</h3>
          
          <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
             <table className="w-full text-left text-xs">
                <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
                  <tr>
                    <th className="p-6">Date</th>
                    <th className="p-6">Ambassadeur</th>
                    <th className="p-6">Produit</th>
                    <th className="p-6">Montant</th>
                    <th className="p-6 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {history.length === 0 ? (<tr><td colSpan={5} className="p-20 text-center opacity-30 text-[10px] uppercase">Aucun historique</td></tr>) : 
                    history.slice(0, 20).map(c => (
                      <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-6 text-neutral-600 font-mono">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="p-6">
                          <div className="font-bold uppercase text-neutral-400">{(c as any).users?.full_name || 'Inconnu'}</div>
                        </td>
                        <td className="p-6 text-neutral-500">{c.products?.name}</td>
                        <td className="p-6 font-mono text-neutral-400">
                          <CurrencyDisplay 
                            amount={c.amount} 
                            className="font-mono text-neutral-400"
                            secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                          />
                        </td>
                        <td className="p-6 text-right">
                          <span className={`px-2 py-1 rounded text-[8px] font-black uppercase ${
                            c.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {c.status === 'approved' ? 'Validé' : 'Refusé'}
                          </span>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
             </table>
             {history.length > 20 && (
               <div className="p-4 text-center border-t border-white/5">
                 <p className="text-[8px] font-black uppercase text-neutral-600">Affichage des 20 dernières ventes</p>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDU ADMIN : GESTION DU CATALOGUE (CRUD) ---
  if (isAdminView && showCatalog) {
    return (
      <div className="space-y-8 animate-fade-in">
        {showProductForm && (
          <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setShowProductForm(false)}></div>
            <GoldBorderCard className="relative w-full max-w-xl bg-[#080808] border-white/10 p-6 md:p-8 shadow-2xl animate-slide-down">
               <div className="flex items-center justify-between mb-6 md:mb-8">
                  <h3 className="text-lg md:text-xl font-black uppercase">{editingProduct ? 'Modifier' : 'Créer'} <GoldText>Produit</GoldText></h3>
                  <button onClick={() => setShowProductForm(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={24}/></button>
               </div>
               <form onSubmit={handleSaveProduct} className="space-y-4">
                  <input required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="Nom du produit" value={productFormData.name} onChange={e => setProductFormData({...productFormData, name: e.target.value})} />
                  <textarea required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white h-24" placeholder="Description courte" value={productFormData.description} onChange={e => setProductFormData({...productFormData, description: e.target.value})} />
                  <div className="grid grid-cols-2 gap-4">
                    <input required type="number" className="bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="Prix Public" value={productFormData.price} onChange={e => setProductFormData({...productFormData, price: parseInt(e.target.value)})} />
                    <input required type="number" className="bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="Com. Ambassadeur" value={productFormData.commission_amount} onChange={e => setProductFormData({...productFormData, commission_amount: parseInt(e.target.value)})} />
                  </div>
                  <input required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="URL Image" value={productFormData.image_url} onChange={e => setProductFormData({...productFormData, image_url: e.target.value})} />
                  <input required className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs text-white" placeholder="Lien de livraison final" value={productFormData.final_link} onChange={e => setProductFormData({...productFormData, final_link: e.target.value})} />
                  <PrimaryButton type="submit" fullWidth isLoading={isSavingProduct}>Enregistrer le produit</PrimaryButton>
               </form>
            </GoldBorderCard>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
           <h3 className="text-xl font-black uppercase text-yellow-500 flex items-center gap-3"><Bag /> Gestion Catalogue</h3>
           <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 md:py-3 bg-yellow-600 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-yellow-500 shadow-xl transition-all"><Plus size={16}/> Ajouter un service</button>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 md:hidden px-2">
          {products.length === 0 ? (
            <div className="p-10 text-center opacity-30 text-[10px] uppercase">Catalogue vide</div>
          ) : (
            products.map(p => (
              <div key={p.id} className="p-5 bg-[#0a0a0a] border border-white/5 rounded-2xl space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-neutral-900 border border-white/5 overflow-hidden flex-shrink-0">
                    <img src={p.image_url} className="w-full h-full object-cover opacity-50" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black uppercase text-white text-sm truncate">{p.name}</div>
                    <div className="flex gap-3 mt-1">
                      <CurrencyDisplay 
                        amount={p.price} 
                        className="text-[10px] font-mono text-neutral-400"
                        secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                      />
                      <CurrencyDisplay 
                        amount={p.commission_amount} 
                        className="text-[10px] font-mono text-yellow-500 font-bold"
                        secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/5 flex justify-end gap-3">
                  <button onClick={() => openEditProduct(p)} className="p-2.5 bg-white/5 text-blue-400 rounded-xl border border-white/10"><Edit3 size={16}/></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-2.5 bg-white/5 text-red-500 rounded-xl border border-white/10"><Trash2 size={16}/></button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
           <table className="w-full text-left text-xs">
              <thead className="bg-black/40 text-[9px] font-black uppercase text-neutral-500 border-b border-neutral-800">
                <tr><th className="p-8">Service / Produit</th><th className="p-8">Prix</th><th className="p-8">Com.</th><th className="p-8 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {products.length === 0 ? (<tr><td colSpan={4} className="p-20 text-center opacity-30 text-[10px] uppercase">Catalogue vide</td></tr>) : 
                  products.map(p => (
                    <tr key={p.id} className="hover:bg-white/[0.02]">
                      <td className="p-8"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-neutral-900 border border-white/5 overflow-hidden"><img src={p.image_url} className="w-full h-full object-cover opacity-50" /></div><span className="font-black uppercase text-white">{p.name}</span></div></td>
                      <td className="p-8 font-mono text-neutral-400">
                        <CurrencyDisplay 
                          amount={p.price} 
                          className="font-mono text-neutral-400"
                          secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                        />
                      </td>
                      <td className="p-8 font-mono text-yellow-500 font-bold">
                        <CurrencyDisplay 
                          amount={p.commission_amount} 
                          className="font-mono text-yellow-500 font-bold"
                          secondaryClassName="text-[8px] text-neutral-600 font-bold ml-1 opacity-60"
                        />
                      </td>
                      <td className="p-8 text-right">
                         <div className="flex justify-end gap-3">
                            <button onClick={() => openEditProduct(p)} className="p-3 bg-white/5 text-blue-400 rounded-xl border border-white/10 hover:bg-blue-600/10"><Edit3 size={16}/></button>
                            <button onClick={() => deleteProduct(p.id)} className="p-3 bg-white/5 text-red-500 rounded-xl border border-white/10 hover:bg-red-600/10"><Trash2 size={16}/></button>
                         </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
           </table>
        </div>
      </div>
    );
  }

  // --- RENDU AMBASSADEUR : ESPACE CATALOGUE (STYLE MZ+ ELITE) ---
  // If a product is selected for detail view, show it
  if (selectedProductForDetail) {
    const productStatsData = {
      clicks: productStats.find(s => s.product_id === selectedProductForDetail.id)?.clicks || 0,
      conversions: commissions.filter(c => c.product_id === selectedProductForDetail.id).length
    };

    // Find the original index to match trend logic
    const productIndex = products.findIndex(p => p.id === selectedProductForDetail.id);

    return (
      <ProductDetailView 
          product={selectedProductForDetail} 
          stats={productStatsData}
          referralCode={profile?.referral_code || 'elite'}
          onBack={() => setSelectedProductForDetail(null)}
          index={productIndex >= 0 ? productIndex : 0}
      />
    );
  }

  if (onlyCatalog) {
    const filteredItems = products.filter(p => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Coherent Sorting: Popularity simulation
    const getHotness = (p: Product) => {
      let hash = 0;
      for (let i = 0; i < p.id.length; i++) hash = p.id.charCodeAt(i) + ((hash << 5) - hash);
      return Math.abs(hash % 100);
    };

    const sortedItems = [...filteredItems].sort((a, b) => getHotness(b) - getHotness(a));

    const popularProducts = sortedItems.slice(0, 3);
    const topSellers = sortedItems.slice(3, 6);
    const recommended = sortedItems.slice(6);

    const productsToDisplay = activeCatalogFilter === 'all' 
      ? sortedItems 
      : activeCatalogFilter === 'popular' 
        ? popularProducts
        : activeCatalogFilter === 'sellers' 
          ? topSellers 
          : recommended;

    return (
      <div className="min-h-screen bg-[#080808] text-white font-sans pb-40">
        {/* Background Accents */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/5 blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* Header Section */}
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-6 py-6 sticky top-0 z-50">
          <div className="flex items-center justify-between max-w-xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                <Crown size={20} className="text-black" />
              </div>
              <h1 className="text-lg font-black italic tracking-tighter text-white">MZ+ <span className="text-yellow-500 uppercase">Market</span></h1>
            </div>
            <div className="relative group cursor-pointer">
              <Activity size={20} className="text-neutral-500 group-hover:text-yellow-500 transition-colors" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full border-2 border-black animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-5 py-8 space-y-10">
          {/* Search Bar - Elite Style */}
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-yellow-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Chercher un service..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[2rem] py-5 pl-16 pr-6 text-xs font-bold text-white placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500/50 transition-all shadow-2xl"
            />
          </div>

          {/* Elite Filters - Compact & Wrapped (No more left scrolling) */}
          <div className="flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => setActiveCatalogFilter('all')}
              className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                activeCatalogFilter === 'all'
                  ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg scale-105' 
                  : 'bg-white/5 text-neutral-500 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>🌐</span> Tout
            </button>
            <button 
              onClick={() => setActiveCatalogFilter('recommended')}
              className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                activeCatalogFilter === 'recommended'
                  ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg scale-105' 
                  : 'bg-white/5 text-neutral-500 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>⭐</span> Favoris
            </button>
            <button 
              onClick={() => setActiveCatalogFilter('sellers')}
              className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                activeCatalogFilter === 'sellers' 
                  ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg scale-105' 
                  : 'bg-white/5 text-neutral-500 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>🔥</span> Ventes
            </button>
            <button 
              onClick={() => setActiveCatalogFilter('popular')}
              className={`flex-1 min-w-[100px] px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                activeCatalogFilter === 'popular' 
                  ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg scale-105' 
                  : 'bg-white/5 text-neutral-500 border-white/5 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>✨</span> Buzz
            </button>
          </div>

          {loading && products.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <Loader2 className="animate-spin text-yellow-500" size={40} />
                <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full"></div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-600 animate-pulse">Initialisation...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {productsToDisplay.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                  clicks={productStats.find(s => s.product_id === product.id)?.clicks || 0} 
                  referralCode={profile?.referral_code} 
                />
              ))}
            </div>
          )}

          {/* Motivational Footer */}
          <div className="mt-20 p-10 rounded-[4rem] bg-gradient-to-br from-[#111] to-black border border-white/5 text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-30"></div>
             <Sparkles size={32} className="mx-auto text-yellow-500 mb-6 animate-pulse" />
             <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white mb-4">L'EXCELLENCE NE S'ATTEND PAS.</h2>
             <p className="text-neutral-500 font-bold uppercase tracking-widest text-[9px] max-w-xs mx-auto leading-loose opacity-60">Chaque partage est un pas de plus vers votre liberté financière. Agissez maintenant.</p>
          </div>
        </div>

        {/* Floating Elite Nav - MZ+ Style */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-black/60 backdrop-blur-3xl border border-white/10 px-8 py-5 flex items-center justify-between z-50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <button onClick={() => onSwitchTab?.('dashboard')} className="flex flex-col items-center gap-1.5 group transition-all active:scale-90">
            <Home size={20} className="text-neutral-600 group-hover:text-yellow-500 transition-colors" />
            <span className="text-[8px] font-black text-neutral-600 group-hover:text-white uppercase tracking-widest">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1.5 relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-12 h-12 bg-yellow-600 rounded-2xl flex items-center justify-center shadow-[0_15px_30px_rgba(202,138,4,0.4)] border border-yellow-500">
               <ShoppingBag size={24} className="text-black" />
            </div>
            <span className="text-[8px] font-black text-yellow-500 uppercase tracking-widest mt-6">Market</span>
          </button>
          <button onClick={() => onSwitchTab?.('profile')} className="flex flex-col items-center gap-1.5 group transition-all active:scale-90">
            <User size={20} className="text-neutral-600 group-hover:text-yellow-500 transition-colors" />
            <span className="text-[8px] font-black text-neutral-600 group-hover:text-white uppercase tracking-widest">Profil</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-20 animate-fade-in pb-32 px-4">
      
      {error && (
        <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-[2rem] text-center space-y-4">
          <p className="text-xs font-black uppercase text-red-500">{error}</p>
          <button 
            onClick={() => fetchData()}
            className="px-6 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-400 transition-all"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* 1. MES GAINS (Focus Central) */}
      <section className="text-center pt-12 space-y-6 overflow-hidden">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-yellow-600/5 border border-yellow-600/10 rounded-full">
          <div className="w-1 h-1 rounded-full bg-yellow-600 animate-pulse"></div>
          <span className="text-[8px] font-black uppercase tracking-[0.4em] text-neutral-500">Trésorerie Affiliation</span>
        </div>
        
        <div id="affiliation-balance-zone" className="space-y-4 py-4">
          <CurrencyDisplay 
            amount={commissions.filter(c => c.status === 'approved').reduce((acc, c) => acc + c.amount, 0)} 
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white font-mono tracking-tighter leading-tight break-words"
            secondaryClassName="text-lg md:text-xl text-yellow-600 font-black uppercase mt-2"
            vertical={true}
          />
          <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em]">Gains Encaissés</p>
        </div>
      </section>

      {/* 2. ANALYSE (Minimaliste & Discret) */}
      <section className="space-y-12">
        <div className="grid grid-cols-3 gap-8 py-10 border-y border-white/5 max-w-2xl mx-auto">
          <div className="text-center space-y-1">
            <p className="text-2xl font-black text-white font-mono">{productStats.reduce((acc, s) => acc + (Number(s.clicks) || 0), 0)}</p>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Clics</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-black text-white font-mono">{commissions.filter(c => c.status === 'approved').length}</p>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Ventes</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-2xl font-black text-white font-mono">
              {(productStats.reduce((acc, s) => acc + (Number(s.clicks) || 0), 0) > 0 
                ? (commissions.filter(c => c.status === 'approved').length / productStats.reduce((acc, s) => acc + (Number(s.clicks) || 0), 0) * 100).toFixed(1) 
                : "0")}%
            </p>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Conv.</p>
          </div>
        </div>

        <div className="flex justify-center w-full px-2">
          <button 
            id="btn-see-products"
            onClick={(e) => {
              e.stopPropagation();
              if (onSwitchTab) onSwitchTab('catalog');
              else scrollToProducts();
            }}
            className="group relative w-full md:w-auto px-10 py-7 bg-white text-black rounded-[2.5rem] font-black uppercase text-[12px] tracking-[0.2em] shadow-[0_40px_80px_rgba(255,255,255,0.15)] hover:bg-yellow-500 hover:scale-[1.02] transition-all duration-500 flex items-center justify-center gap-4 active:scale-[0.95] overflow-hidden cursor-pointer"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
            
            <span className="relative z-10 pointer-events-none">Voir les produits à promouvoir</span>
            <ChevronDown size={20} className="relative z-10 group-hover:translate-y-2 transition-transform duration-500 pointer-events-none" />
          </button>
        </div>
      </section>

      {/* 3. VOIR LES PRODUITS (Catalogue Actionnable) */}
      {isCatalogVisible && (
        <section ref={productsRef} className="space-y-24 scroll-mt-20 min-h-[400px] animate-fade-in pt-10">
          <div className="flex items-center gap-6 px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white whitespace-nowrap">Catalogue Élite</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>

          <div className="space-y-20">
            {products.length === 0 ? (
              <div className="py-20 text-center bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Aucun produit disponible pour le moment</p>
                <button 
                  onClick={() => fetchData()}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Actualiser le catalogue
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map((product, index) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      index={index}
                      clicks={productStats.find(s => s.product_id === product.id)?.clicks || 0} 
                      referralCode={profile?.referral_code} 
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* 4. HISTORIQUE (Optionnel / Déroulant pour la clarté) */}
      {commissions.length > 0 && (
        <section className="pt-10 border-t border-white/5 max-w-2xl mx-auto">
          <details className="group">
            <summary className="list-none cursor-pointer flex items-center justify-between text-neutral-700 hover:text-neutral-400 transition-colors py-4">
              <span className="text-[9px] font-black uppercase tracking-[0.4em]">Historique des ventes</span>
              <ChevronDown size={14} className="group-open:rotate-180 transition-transform duration-500" />
            </summary>
            <div className="mt-8 space-y-3 animate-fade-in">
              {commissions.map(c => (
                <div key={c.id} className="p-5 bg-neutral-900/20 border border-white/5 rounded-3xl flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${c.status === 'approved' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-tight">{c.products?.name || 'Service MZ+'}</p>
                      <p className="text-[7px] text-neutral-600 font-bold uppercase tracking-widest mt-0.5">{new Date(c.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <CurrencyDisplay 
                    amount={c.amount} 
                    className="text-xs font-black text-yellow-500 font-mono"
                    secondaryClassName="text-[8px] text-neutral-600 font-bold opacity-60"
                    vertical={true}
                  />
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      <footer className="pt-20 opacity-10 text-center">
        <Shield size={24} className="mx-auto text-neutral-500" />
      </footer>
    </div>
  );
};




const ShareModal = ({ isOpen, onClose, product, link }: { isOpen: boolean, onClose: () => void, product: Product, link: string }) => {
  const [copied, setCopied] = useState(false);

  const shareTitle = `Découvre : ${product.name} sur MZ+ Elite`;
  const shareText = `Je te recommande ce service sur MZ+ Elite : ${product.name}.\nC'est vraiment top pour booster tes activités !\n\nLien direct 👇\n${link}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(shareText)}`;
        break;
      case 'gmail':
        url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText)}`;
        break;
    }
    if (url) window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-30"></div>
        
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500">
                 <Share2 size={18} />
              </div>
              <h3 className="text-sm font-black uppercase tracking-tighter">Partager le produit</h3>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X size={20} />
           </button>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-4">
              <img src={product.image_url} className="w-16 h-16 rounded-2xl object-cover border border-white/10" alt="" />
              <div className="flex-1 min-w-0">
                 <p className="text-[10px] font-black uppercase text-yellow-500 leading-none mb-1">Elite Product</p>
                 <h4 className="text-sm font-black text-white uppercase italic truncate tracking-tight">{product.name}</h4>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3 pb-2">
              <button 
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/10 hover:bg-emerald-500/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.058-4.51 10.06-10.059.002-2.689-1.047-5.215-2.951-7.121-1.905-1.905-4.432-2.954-7.122-2.956-5.549 0-10.06 4.511-10.063 10.06-.001 2.032.547 3.513 1.488 5.13l-.999 3.648 3.731-.979zm11.367-7.393c-.31-.154-1.829-.903-2.11-.1.282-.102-.338-.204-.984-1.392-.506-.21-.422-.224-.744-.095-.547-.223-2.01-.739-3.344-1.928-1.037-.926-1.74-2.069-1.942-2.422-.204-.353-.021-.544.155-.72.158-.159.352-.412.529-.617.175-.206.234-.352.352-.588.117-.235.059-.441-.03-.617-.089-.176-.744-1.792-1.018-2.454-.267-.643-.538-.556-.744-.567-.19-.009-.41-.01-.63-.01-.22 0-.58.083-.884.412-.303.33-1.157 1.132-1.157 2.76 0 1.629 1.186 3.203 1.353 3.424.167.221 2.335 3.563 5.656 4.996.79.341 1.405.544 1.886.696.791.248 1.512.213 2.081.127.635-.095 1.829-.747 2.086-1.468.257-.721.257-1.341.18-1.468-.077-.127-.282-.204-.593-.352z"/></svg>
                </div>
                <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">WhatsApp</span>
              </button>

              <button 
                onClick={() => handleShare('facebook')}
                className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-blue-500/10 border border-blue-500/10 hover:bg-blue-500/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <Facebook size={18} />
                </div>
                <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Facebook</span>
              </button>

              {navigator.share && (
                <button 
                  onClick={() => {
                    navigator.share({
                      title: shareTitle,
                      text: shareText,
                      url: link
                    }).catch(console.error);
                  }}
                  className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Share2 size={18} />
                  </div>
                  <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest">Autres</span>
                </button>
              )}
           </div>

           {/* Prominent Copy Link Section */}
           <div className="pt-4 border-t border-white/5 space-y-3">
              <p className="text-[8px] font-black uppercase text-neutral-600 tracking-widest ml-1">Copier le Lien Affilié</p>
              <div className="flex items-center gap-2 p-2 bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                 <div className="flex-1 px-3 py-1.5 font-mono text-[9px] text-neutral-500 truncate lowercase">
                    {link}
                 </div>
                 <button 
                   onClick={handleCopy}
                   className={`px-5 py-2.5 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all active:scale-95 flex items-center gap-2 ${
                     copied ? 'bg-emerald-600 text-white' : 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-lg'
                   }`}
                 >
                   {copied ? <Check size={12} strokeWidth={3} /> : <LinkIcon size={12} strokeWidth={3} />}
                   <span>{copied ? 'Copié' : 'Copier'}</span>
                 </button>
              </div>
           </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
           <p className="text-[7px] font-bold text-neutral-600 uppercase tracking-[0.3em]">Copiez votre lien unique pour gagner des commissions</p>
        </div>
      </motion.div>
    </div>
  );
};




// Smart Strategic Trend Simulation
const getProductTrend = (product: Product, index: number) => {
  // Generate a deterministic seed based on product and current time block (1 hour)
  const timeBlock = Math.floor(Date.now() / (1000 * 60 * 60)); 
  const seed = `${product.id}-${timeBlock}`;
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const absHash = Math.abs(hash);
  
  // Logic: 75% of products show positive activity
  const isPositive = (absHash % 10) < 7.5;
  const percentage = (absHash % 18) + 12; // 12% to 30% growth
  
  // Real-time activity numbers
  const salesToday = (absHash % 180) + 80 + (isPositive ? 100 : 0); // ~80 to 360
  const viewersNow = (absHash % 60) + 15 + (isPositive ? 30 : 0);   // ~15 to 105
  const isTopSeller = index === 0 || (absHash % 12 === 0);

  // Dynamic strategic messages from user request
  const phrases = [
    "🔥 Ça vend fort aujourd’hui… et si c’était ton tour ?",
    "💸 Certains font déjà des ventes avec ce produit…",
    "🚀 Ce produit commence vraiment à marcher en ce moment",
    "📈 Les ventes montent doucement… tu peux en faire partie",
    "👥 De plus en plus de personnes s’y mettent…",
    "🤑 Il y a de l’argent qui circule ici…",
    "🔥 Explosion des ventes aujourd’hui grâce à ce produit",
    "🚀 Ce produit décolle en ce moment",
    "💸 Des utilisateurs génèrent des commissions chaque heure grâce à ce produit",
    "🎯 Simple à promouvoir… parfait pour commencer",
    "💰 D’autres gagnent déjà avec… pourquoi pas toi ?",
    "⚡ Ça bouge beaucoup sur ce produit en ce moment",
    "⭐ Beaucoup commencent par celui-ci…",
    "🔄 Les ventes continuent… tranquillement mais sûrement",
    "🚨 Ça prend de l’ampleur… c’est peut-être le bon moment"
  ];

  let dynamicMessage = phrases[absHash % phrases.length];
  
  // Priority overlays
  if (isTopSeller) {
    dynamicMessage = "🏆 Produit le plus vendu du jour";
  } else if (percentage > 25) {
    dynamicMessage = "🔥 Explosion des ventes aujourd’hui grâce à ce produit";
  }

  // Final validation: if not positive, hide the message
  const finalMessage = isPositive ? dynamicMessage : null;

  return { isPositive, percentage, salesToday, viewersNow, isTopSeller, dynamicMessage: finalMessage, absHash };
};

const ProductDetailView = ({ product, stats, referralCode, onBack, index }: { product: Product, stats: { clicks: number, conversions: number }, referralCode: string, onBack: () => void, index: number }) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const link = `${window.location.origin}/?ref=${referralCode}&prod=${product.id}`;
  
  const trend = getProductTrend(product, index);
  const totalEarned = stats.conversions * product.commission_amount;

  return (
    <>
      <div className="fixed inset-0 z-[600] bg-black text-white flex flex-col font-sans overflow-x-hidden overflow-y-auto">
      {/* Optimized Background - High Performance Dopamine */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-500/5 via-rose-500/5 to-emerald-500/5"></div>
        <motion.div 
          animate={{ 
            opacity: [0.03, 0.08, 0.03],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(234,179,8,0.15)_0%,transparent_70%)] blur-[80px]"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
      </div>

      {/* Header Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl px-6 py-5 flex items-center justify-between border-b border-white/5"
      >
         <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-95 border border-white/5">
            <ArrowLeft size={20} />
         </button>
         <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full shadow-[0_0_8px_#eab308] animate-pulse"></div>
              <p className="text-[7px] font-black uppercase text-yellow-500 tracking-[0.4em]">Flux de Profit Live</p>
            </div>
            <h2 className="text-[10px] font-black uppercase italic text-white tracking-widest opacity-80">Poste de Contrôle</h2>
         </div>
         <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
            <Zap size={18} fill="currentColor" />
         </div>
      </motion.div>

      <div className="relative z-10 p-6 md:p-10 space-y-8 max-w-2xl mx-auto w-full pb-32">
         
         {/* Refactored Product Hero - Smooth & Clean */}
         <div className="py-8 md:py-12 flex flex-col items-center text-center space-y-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/5 blur-[80px] -z-10"></div>
            
            <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ type: "spring", damping: 20 }}
               className="relative"
            >
               <motion.img 
                  animate={{ 
                    y: [0, -8, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  src={product.image_url} 
                  className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-[0_15px_40px_rgba(234,179,8,0.25)]" 
                  alt="" 
               />
               {trend.isPositive && (
                 <div className="absolute -top-2 -right-2 bg-yellow-500 text-black text-[9px] font-black px-3 py-1 rounded-lg shadow-xl uppercase tracking-tighter animate-bounce-gentle">
                   🔥 Tendance
                 </div>
               )}
            </motion.div>

            <div className="space-y-4">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="flex justify-center items-center gap-3"
               >
                  <div className="h-[1px] w-6 bg-yellow-500/30"></div>
                  <span className="text-[9px] font-black text-yellow-500 uppercase tracking-[0.4em] italic">Opportunité Elite</span>
                  <div className="h-[1px] w-6 bg-yellow-500/30"></div>
               </motion.div>
               
               <motion.h3 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none"
               >
                 <span className="text-white drop-shadow-lg">{product.name}</span>
               </motion.h3>

               <div className="flex flex-wrap justify-center gap-6 pt-2">
                  <div className="text-center">
                     <p className="text-[7px] font-black text-neutral-500 uppercase tracking-widest mb-1">Commission Flash</p>
                     <p className="text-3xl md:text-5xl font-black text-emerald-400 font-mono italic tracking-tight">+{product.commission_amount.toLocaleString()} <span className="text-[10px]">FCFA</span></p>
                  </div>
                  <div className="w-px h-10 bg-white/5 self-center"></div>
                  <div className="text-center opacity-50">
                     <p className="text-[7px] font-black text-neutral-500 uppercase tracking-widest mb-1">Valeur Marchande</p>
                     <p className="text-xl md:text-2xl font-black text-white font-mono italic">{product.price.toLocaleString()} FCFA</p>
                  </div>
               </div>
            </div>
         </div>

          {/* IMMERSIVE DOPAMINE STATS - Not a card, an experience */}
         <section className="relative py-12">
            <div className="absolute inset-0 bg-yellow-500/5 blur-[100px] -z-10"></div>
            
            <div className="flex flex-col items-center text-center space-y-14">
               {/* Central Display */}
               <motion.div 
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="relative"
               >
                  <div className="absolute inset-0 bg-yellow-500/10 blur-3xl rounded-full scale-150"></div>
                  <div className="relative z-10 flex flex-col items-center">
                     <div className="text-[120px] md:text-[150px] font-black text-white font-mono leading-none tracking-tighter drop-shadow-2xl group flex items-baseline gap-2">
                        {trend.salesToday}
                        <span className="text-xl text-yellow-500/50 animate-pulse">⚡</span>
                     </div>
                     <div className="space-y-4">
                        <div className="flex flex-col items-center gap-1">
                          <p className="text-xs font-black text-yellow-500 uppercase tracking-[0.5em] italic drop-shadow-lg">Ventes Aujourd'hui</p>
                          <div className="flex items-center gap-2 mt-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none">
                              Ce produit a été vendu {trend.salesToday + (trend.absHash % 40) + 120} fois au total
                            </span>
                          </div>
                        </div>
                     </div>
                  </div>
               </motion.div>

               {/* Strategic Ticker / Dynamic Phrase */}
               {trend.dynamicMessage && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 0.3 }}
                     className="w-full max-w-2xl px-6"
                  >
                     <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 overflow-hidden group/phrase">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/phrase:animate-shimmer"></div>
                        <p className="text-xl md:text-2xl font-black text-white italic tracking-tighter text-center leading-tight">
                           "{trend.dynamicMessage}"
                        </p>
                     </div>
                  </motion.div>
               )}

               {/* Activity Meter */}
               <div className="w-full max-w-sm space-y-4">
                  <div className="flex justify-between items-end px-2">
                     <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Performance Directe</span>
                        <span className="text-md font-black text-white uppercase italic">Volume de Commissions Élevé</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500 text-black text-[10px] font-black rounded-lg">
                        <TrendingUp size={12} />
                        +{trend.percentage}% H/H
                     </div>
                  </div>
                  <div className="h-3 w-full bg-white/5 rounded-2xl p-0.5 border border-white/5 overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "88%" }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="h-full bg-yellow-500 rounded-xl relative"
                     >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shimmer"></div>
                     </motion.div>
                  </div>
               </div>

               {/* Live Participants */}
               <div className="flex flex-col items-center gap-5">
                  <div className="flex -space-x-3">
                     {[...Array(5)].map((_, i) => (
                        <div 
                           key={i}
                           className="w-10 h-10 rounded-full border-2 border-black bg-neutral-900 flex items-center justify-center text-yellow-500/50 shadow-2xl overflow-hidden"
                        >
                           <User size={16} />
                        </div>
                     ))}
                     <div className="w-10 h-10 rounded-full border-2 border-black bg-yellow-500 text-black flex items-center justify-center text-[9px] font-black z-10 shadow-2xl">
                        +{trend.viewersNow}
                     </div>
                  </div>
                  <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.4em] text-center">
                     Utilisateurs captent des commissions en ce moment
                  </p>
               </div>
            </div>
         </section>
            {/* Your Profit Impact */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.5 }}
               className="bg-[#0a0a09] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl"
            >
               <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-700"></div>
               
               <div className="space-y-6 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-lg">
                     <Coins size={24} />
                  </div>
                  <div>
                     <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em] mb-1">Votre Profit Total</p>
                     <motion.h4 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-4xl font-black text-emerald-400 font-mono tracking-tighter"
                     >
                        +{totalEarned.toLocaleString()}
                     </motion.h4>
                     <p className="text-[7px] font-bold text-neutral-700 uppercase tracking-widest mt-1 italic">Sur ce canal uniquement</p>
                  </div>
               </div>

               <div className="pt-4 relative z-10">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "65%" }}
                        transition={{ delay: 1, duration: 1.5 }}
                        className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
                     />
                  </div>
                  <div className="flex justify-between mt-2">
                     <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">Niveau Prochain</span>
                     <span className="text-[7px] font-black text-neutral-400 uppercase tracking-widest">+150K Bonus</span>
                  </div>
               </div>
            </motion.div>
         </div>

         {/* YOUR WEALTH PROJECTION - Dopamine Generator */}
         <motion.section 
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="bg-gradient-to-br from-[#111] to-black border border-white/5 rounded-[3rem] p-10 space-y-8 relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 p-10 opacity-[0.02] -rotate-12">
               <Coins size={180} />
            </div>

            <div className="relative z-10 text-center md:text-left space-y-2">
               <h4 className="text-sm font-black text-yellow-500 uppercase italic tracking-tighter">Votre Plan de Richesse</h4>
               <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Combien voulez-vous encaisser ?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
               {[
                  { qty: 10, label: "Objectif Débutant" },
                  { qty: 50, label: "Objectif Elite", popular: true },
                  { qty: 100, label: "Objectif Empire" }
               ].map((item, i) => (
                  <div key={i} className={`p-6 rounded-[2rem] border transition-all hover:scale-105 duration-500 ${item.popular ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-white/[0.03] border-white/10'}`}>
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-[9px] font-black uppercase text-neutral-400">{item.qty} Ventes</span>
                        {item.popular && <div className="px-2 py-0.5 bg-yellow-500 text-black text-[7px] font-black rounded-md animate-pulse uppercase">Hot</div>}
                     </div>
                     <p className="text-2xl font-black text-white font-mono italic">{(item.qty * product.commission_amount).toLocaleString()} <span className="text-[10px]">FCFA</span></p>
                     <p className="text-[8px] font-bold text-neutral-600 uppercase mt-2">{item.label}</p>
                  </div>
               ))}
            </div>

            <div className="pt-4 flex flex-col md:flex-row items-center gap-4 justify-between border-t border-white/5 relative z-10">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                     <TrendingUp size={18} />
                  </div>
                  <p className="text-[9px] text-neutral-400 font-medium leading-tight">
                     Chaque clic est une <span className="text-white font-black">opportunité de gain</span>.<br />
                     Prêt à transformer votre influence ?
                  </p>
               </div>
               <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-6 py-2 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-white uppercase tracking-widest"
               >
                  Elite ROI: 94.2%
               </motion.div>
            </div>
         </motion.section>

         {/* THE MONEY MAKER - CENTRAL CALL TO ACTION */}
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.7 }}
           className="relative"
         >
            <div className="absolute -inset-4 bg-yellow-500/10 blur-3xl opacity-50 animate-pulse"></div>
            <button 
              onClick={() => setIsShareModalOpen(true)}
              className="relative w-full py-8 bg-white text-black rounded-[2.5rem] font-black uppercase text-base tracking-[0.3em] shadow-[0_30px_60px_rgba(255,255,255,0.15)] hover:bg-yellow-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex flex-col items-center justify-center gap-1 group overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none"></div>
               <div className="flex items-center gap-3">
                  <Zap size={22} fill="currentColor" />
                  Générer de l'Argent Maintenant
               </div>
               <span className="text-[8px] font-black opacity-40 uppercase tracking-widest">Lancez votre campagne de profit</span>
            </button>
         </motion.div>

         {/* Social Proof & Excitement */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
               { icon: User, label: "Utilisateurs", value: trend.viewersNow + " Actifs", color: "text-blue-400" },
               { icon: Activity, label: "Saturation", value: "Faible (2%)", color: "text-emerald-400" },
               { icon: Sparkles, label: "Potentiel", value: "Elite", color: "text-yellow-500" },
               { icon: Clock, label: "Validation", value: "Instantanée", color: "text-purple-400" }
            ].map((item, i) => (
               <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (i * 0.1) }}
                  className="p-5 bg-white/[0.02] border border-white/5 rounded-[2rem] flex flex-col items-center text-center gap-2 hover:bg-white/[0.05] transition-all cursor-default"
               >
                  <item.icon size={14} className={item.color} />
                  <div>
                     <p className="text-[7px] font-black text-neutral-600 uppercase tracking-widest mb-0.5">{item.label}</p>
                     <p className="text-[9px] font-black text-white uppercase">{item.value}</p>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Strategy Booster (The "How to Win" emotions) */}
         <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1.2 }}
           className="space-y-6 pt-6"
         >
            <div className="flex items-center gap-4">
               <h4 className="text-[10px] font-black uppercase text-white tracking-[0.5em] italic">Stratégies de Richesse</h4>
               <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="group p-8 bg-gradient-to-br from-neutral-900 to-[#080808] border border-white/5 rounded-[2.5rem] hover:border-yellow-500/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-6 group-hover:scale-110 transition-transform">
                     <Target size={20} />
                  </div>
                  <h5 className="text-sm font-black text-white uppercase mb-3 italic tracking-tight">Le Hack Psychologique</h5>
                  <p className="text-[11px] text-neutral-400 font-medium leading-relaxed opacity-60">
                     Ne mentionnez pas le prix directement. Parlez d'abord de la <span className="text-white">transformation massive</span> que ce service apporte. Le cerveau achète le résultat, pas le coût.
                  </p>
               </div>

               <div className="group p-8 bg-gradient-to-br from-neutral-900 to-[#080808] border border-white/5 rounded-[2.5rem] hover:border-purple-500/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                     <MessageCircle size={20} />
                  </div>
                  <h5 className="text-sm font-black text-white uppercase mb-3 italic tracking-tight">Le Social Sell Elite</h5>
                  <p className="text-[11px] text-neutral-400 font-medium leading-relaxed opacity-60">
                     Utilisez la story WhatsApp à 19h. C'est là que <span className="text-white">le trafic est maximal</span>. Publiez une simple question excitante avant d'envoyer votre lien affilié.
                  </p>
               </div>
            </div>
         </motion.div>

         {/* Share Modal Integration */}
         <ShareModal 
           isOpen={isShareModalOpen} 
           onClose={() => setIsShareModalOpen(false)} 
           product={product} 
           link={link} 
         />
      </div>

      {/* Extreme Bottom Button (Sticky on mobile) */}
      <div className="sticky bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex justify-center z-50">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => onBack()}
            className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 hover:text-white transition-all shadow-2xl"
          >
            ← Fermer & Agir
          </motion.button>
      </div>
    </>
  );
};

const ProductCard = ({ product, clicks, referralCode, index }: any) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const link = `${window.location.origin}/?ref=${referralCode}&prod=${product.id}`;
  const trend = getProductTrend(product, index);

  const handleCopy = () => {
    setIsShareModalOpen(true);
    window.dispatchEvent(new CustomEvent('affiliation_link_copied', { detail: { productId: product.id } }));
  };

  return (
    <>
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        product={product} 
        link={link} 
      />
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ x: 5 }}
        onClick={() => window.dispatchEvent(new CustomEvent('show_product_detail', { detail: product }))}
        className="group relative bg-white/[0.03] border border-white/5 rounded-[1.5rem] p-4 cursor-pointer overflow-hidden transition-all hover:bg-white/[0.06] hover:border-yellow-500/30 flex items-center gap-4"
      >
        {/* Compact Image Section */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 bg-black/40 rounded-2xl flex items-center justify-center p-2 relative">
            <motion.img 
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              src={product.image_url} 
              className="w-full h-full object-contain drop-shadow-xl" 
              alt="" 
            />
          </div>
          {trend.isPositive && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-black">
              <Zap size={8} fill="currentColor" />
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-black text-white italic truncate uppercase tracking-tight group-hover:text-yellow-500 transition-colors">
              {product.name}
            </h4>
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[7px] font-black text-yellow-500 font-mono tracking-tighter bg-yellow-500/10 px-1.5 py-0.5 rounded-sm">
                {clicks} CLICS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-[6px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-0.5">Com.</span>
              <span className="text-base font-black text-emerald-400 font-mono italic leading-none">+{product.commission_amount.toLocaleString()}</span>
            </div>
            <div className="w-px h-5 bg-white/10"></div>
            <div className="flex flex-col opacity-50">
              <span className="text-[6px] font-black text-neutral-500 uppercase tracking-widest leading-none mb-0.5">Prix</span>
              <span className="text-[10px] font-black text-white font-mono leading-none">{product.price.toLocaleString()}</span>
            </div>
          </div>

          {trend.isPositive && trend.dynamicMessage && (
            <p className="text-[8px] font-black text-neutral-400 uppercase italic truncate opacity-60">
              {trend.dynamicMessage}
            </p>
          )}
        </div>

        {/* Action Indicator */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            className="w-10 h-10 rounded-xl bg-yellow-500 text-black flex items-center justify-center shadow-lg active:scale-90 hover:bg-yellow-400 transition-all"
          >
            <Zap size={16} fill="currentColor" />
          </button>
        </div>
      </motion.div>
    </>
  );
};

