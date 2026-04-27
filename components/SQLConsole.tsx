
import React, { useState, useEffect, useRef } from 'react';
import initSqlJs, { Database } from 'sql.js';
import { Play, Database as DbIcon, FileCode, AlertCircle, CheckCircle2, Copy, Terminal } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SQLConsoleProps {
  profile: any;
}

export const SQLConsole: React.FC<SQLConsoleProps> = ({ profile }) => {
  const [db, setDb] = useState<Database | null>(null);
  const [query, setQuery] = useState<string>('SELECT * FROM users;');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'local' | 'supabase'>('local');
  const [sqlFiles, setSqlFiles] = useState<{name: string, content: string}[]>([]);

  useEffect(() => {
    const initDb = async () => {
      try {
        const SQL = await initSqlJs({
          locateFile: (file) => `https://sql.js.org/dist/${file}`
        });
        const newDb = new SQL.Database();
        
        // Create sample tables for local playground
        newDb.run(`
          CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, rank TEXT);
          INSERT INTO users VALUES (1, 'Jean Dupont', 'jean@example.com', 'Ambassadeur');
          INSERT INTO users VALUES (2, 'Marie Curie', 'marie@example.com', 'Elite');
          INSERT INTO users VALUES (3, 'Admin MZ+', 'admin@mz.plus', 'Super Admin');
          
          CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL);
          INSERT INTO products VALUES (1, 'Pack Elite', 99.99);
          INSERT INTO products VALUES (2, 'Coaching IA', 49.99);
        `);
        
        setDb(newDb);
      } catch (err: any) {
        console.error("SQL.js init error:", err);
        setError("Erreur lors de l'initialisation du moteur SQL.");
      } finally {
        setLoading(false);
      }
    };

    initDb();
  }, []);

  const runQuery = () => {
    if (!db) return;
    setError(null);
    try {
      const res = db.exec(query);
      if (res.length > 0) {
        setResults(res[0].values.map(row => {
          const obj: any = {};
          res[0].columns.forEach((col, i) => {
            obj[col] = row[i];
          });
          return obj;
        }));
      } else {
        setResults([]);
        setError("Requête exécutée avec succès (aucun résultat à afficher).");
      }
    } catch (err: any) {
      setError(err.message);
      setResults([]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copié dans le presse-papier !");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-yellow-500">
        <Terminal className="animate-pulse mr-2" />
        Chargement de la console SQL...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/10 rounded-lg">
            <Terminal className="text-yellow-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Console SQL Admin</h1>
            <p className="text-gray-400 text-sm italic">Testez vos requêtes et gérez votre schéma</p>
          </div>
        </div>
        
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button 
            onClick={() => setActiveTab('local')}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
              activeTab === 'local' ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"
            )}
          >
            Playground Local (SQLite)
          </button>
          <button 
            onClick={() => setActiveTab('supabase')}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-medium transition-all",
              activeTab === 'supabase' ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"
            )}
          >
            Scripts Supabase
          </button>
        </div>
      </div>

      {activeTab === 'local' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="bg-zinc-800/50 px-4 py-2 flex items-center justify-between border-bottom border-zinc-800">
                <span className="text-xs font-mono text-gray-400">query.sql</span>
                <button 
                  onClick={runQuery}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 rounded text-xs font-bold transition-colors"
                >
                  <Play size={12} fill="currentColor" />
                  EXÉCUTER
                </button>
              </div>
              <textarea 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-48 bg-transparent p-4 font-mono text-sm text-yellow-100 focus:outline-none resize-none"
                spellCheck={false}
              />
            </div>

            {error && (
              <div className={cn(
                "p-4 rounded-lg flex items-start gap-3 text-sm",
                error.includes("succès") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
              )}>
                {error.includes("succès") ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <p>{error}</p>
              </div>
            )}

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="bg-zinc-800/50 px-4 py-2 border-bottom border-zinc-800">
                <span className="text-xs font-mono text-gray-400">Résultats ({results.length})</span>
              </div>
              <div className="overflow-x-auto">
                {results.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-800/30 text-gray-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        {Object.keys(results[0]).map(key => (
                          <th key={key} className="px-4 py-3 font-medium">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {results.map((row, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="px-4 py-3 text-gray-300 font-mono">{val?.toString()}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center text-gray-500 italic text-sm">
                    Aucun résultat à afficher. Exécutez une requête SELECT.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <DbIcon size={16} className="text-yellow-500" />
                Schéma Local
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Table: users</p>
                  <ul className="text-xs space-y-1 text-gray-400 font-mono">
                    <li>id (INTEGER)</li>
                    <li>name (TEXT)</li>
                    <li>email (TEXT)</li>
                    <li>rank (TEXT)</li>
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Table: products</p>
                  <ul className="text-xs space-y-1 text-gray-400 font-mono">
                    <li>id (INTEGER)</li>
                    <li>name (TEXT)</li>
                    <li>price (REAL)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/5 rounded-xl border border-yellow-500/10 p-4">
              <h3 className="text-xs font-bold text-yellow-500 mb-2">Aide SQL</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Utilisez cette console pour tester vos requêtes SQLite avant de les appliquer sur Supabase. 
                Notez que SQLite et PostgreSQL ont des syntaxes légèrement différentes.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <FileCode className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Scripts de Configuration Supabase</h2>
                <p className="text-gray-400 text-sm">
                  Ces scripts doivent être exécutés dans l'éditeur SQL de votre tableau de bord Supabase pour initialiser ou mettre à jour votre base de données.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'database_setup.sql', desc: 'Initialisation des tables et colonnes de base.' },
                { name: 'schema_fix.sql', desc: 'Correction des structures de données et types.' },
                { name: 'fix_products_rls.sql', desc: 'Configuration de la sécurité (RLS) pour les produits.' },
                { name: 'ranking_fix.sql', desc: 'Mise à jour du système de classement des ambassadeurs.' }
              ].map(file => (
                <div key={file.name} className="bg-zinc-800/30 border border-zinc-800 p-4 rounded-xl hover:border-zinc-700 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-white font-mono">{file.name}</span>
                    <button 
                      onClick={() => copyToClipboard(`-- Contenu de ${file.name} à copier depuis le projet`)}
                      className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all"
                      title="Copier le script"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">{file.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-green-500" size={20} />
                <span className="text-sm text-gray-300">Prêt à configurer votre base de données ?</span>
              </div>
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                Ouvrir Supabase
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
