import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase for manifest route
const envSupabaseUrl = process.env.VITE_SUPABASE_URL;
const envSupabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_URL = (envSupabaseUrl && envSupabaseUrl !== '') ? envSupabaseUrl : 'https://ydkicdhcylpdffuzgdvm.supabase.co';
const SUPABASE_ANON_KEY = (envSupabaseKey && envSupabaseKey !== '') ? envSupabaseKey : 'sb_publishable_E_rpgEr5_Vf1_1wkLBGKNQ_hxvfdeED';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Dynamic Icon Route
  app.get('/icon.png', async (req, res) => {
    try {
      const { data } = await supabase.from('mz_app_config').select('icon_base64').eq('id', 'main-config').maybeSingle();
      if (data?.icon_base64) {
        const base64Data = data.icon_base64.split(',')[1];
        if (base64Data) {
          const img = Buffer.from(base64Data, 'base64');
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Content-Length', img.length);
          res.send(img);
          return;
        }
      }
      res.redirect('https://ui-avatars.com/api/?name=MZ&background=ca8a04&color=fff&size=512&format=png');
    } catch (error) {
      res.status(500).send('Error');
    }
  });

  // Dynamic Manifest Route
  app.get('/manifest.json', async (req, res) => {
    try {
      const { data } = await supabase.from('mz_app_config').select('*').eq('id', 'main-config').maybeSingle();
      
      const customName = data?.app_name || 'MZ+ Elite';
      // Use the stable route for icons instead of raw base64 for better compatibility
      const iconUrl = '/icon.png?v=' + (data?.updated_at ? new Date(data.updated_at).getTime() : Date.now());

      const manifest = {
        "id": "mz-plus-elite-system",
        "name": customName,
        "short_name": customName.substring(0, 12),
        "description": "Système Élite - " + customName,
        "icons": [
          {
            "src": iconUrl,
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
          },
          {
            "src": iconUrl,
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "maskable"
          }
        ],
        "start_url": "/",
        "display": "standalone",
        "background_color": "#000000",
        "theme_color": "#ca8a04",
        "scope": "/"
      };

      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(manifest));
    } catch (error) {
      console.error('Manifest generation error:', error);
      // Fallback a un manifest statique en cas d'erreur
      res.sendFile(path.join(process.cwd(), 'public', 'manifest.json'));
    }
  });

  // Initialize Firebase Admin
  let serviceAccount;
  const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;
  let firebaseAdminReady = false;

  if (serviceAccountStr) {
    try {
      serviceAccount = JSON.parse(serviceAccountStr);
    } catch (e) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT env var:', e);
    }
  } else {
    try {
      const fs = await import('fs');
      const saPath = path.join(process.cwd(), 'service-account.json');
      if (fs.existsSync(saPath)) {
        serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
        console.log('Using service-account.json file for Firebase Admin');
      }
    } catch (error) {
      console.warn('service-account.json not found or invalid');
    }
  }

  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      firebaseAdminReady = true;
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
    }
  } else {
    console.warn('No Firebase Service Account found (env or file)');
  }

  // API Route to send real FCM Push
  app.post('/api/send-push', async (req, res) => {
    if (!firebaseAdminReady) {
      return res.status(500).json({ error: 'Firebase Admin not configured' });
    }

    const { token, tokens, title, body, target } = req.body;

    try {
      const { data: config } = await supabase.from('mz_app_config').select('icon_base64').eq('id', 'main-config').maybeSingle();
      const appIcon = config?.icon_base64 || 'https://ui-avatars.com/api/?name=MZ&background=ca8a04&color=fff&size=512&format=png';

      const messagePayload = {
        notification: {
          title: title,
          body: body,
          image: appIcon
        },
        data: { 
          title: title, 
          body: body, 
          url: '/',
          icon: appIcon
        },
        android: { 
          priority: 'high' as const,
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
            icon: 'stock_ticker_update' // generic icon reference or URL
          }
        },
        webpush: { 
          headers: { 
            'Urgency': 'high'
          }, 
          notification: {
            icon: appIcon,
            badge: appIcon
          },
          fcmOptions: { 
            link: '/' 
          }
        }
      };

      if (target === 'all' || tokens) {
        const targetTokens = Array.from(new Set(tokens || [])).filter(Boolean); // Déduplication
        console.log(`FCM: Sending to ${targetTokens.length} unique tokens`);
        
        const response = await admin.messaging().sendEach(targetTokens.map((t: any) => ({
          ...messagePayload,
          token: t
        })));
        
        console.log('FCM Multicast Results:', JSON.stringify(response.responses.map(r => r.success ? 'OK' : r.error?.message)));
        return res.json({ success: true, details: response });
      } else if (token) {
        console.log(`FCM: Sending to single token: ${token.substring(0, 15)}...`);
        const response = await admin.messaging().send({ ...messagePayload, token });
        console.log('FCM Success ID:', response);
        return res.json({ success: true, messageId: response });
      }

      res.status(400).json({ error: 'Missing token(s)' });
    } catch (error: any) {
      console.error('CRITICAL FCM ERROR:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
