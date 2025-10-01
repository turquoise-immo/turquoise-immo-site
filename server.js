/* server.js - minimal backend (Express + file storage) */
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const session = require('express-session');

const DATA_DIR = path.join(__dirname, 'data'); if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const LISTINGS_FILE = path.join(DATA_DIR, 'listings.json'); const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const RDVS_FILE = path.join(DATA_DIR, 'rdvs.json'); const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');

function readJson(file,fallback){ try{ if(!fs.existsSync(file)) return fallback; return JSON.parse(fs.readFileSync(file,'utf8')||'null')||fallback; }catch(e){ return fallback; } }
function writeJson(file,data){ fs.writeFileSync(file, JSON.stringify(data,null,2),'utf8'); }

if(!fs.existsSync(LISTINGS_FILE)){ writeJson(LISTINGS_FILE, [ { id:'A100', title:'Bel appartement lumineux 3 pièces', price:350000, surface:72, city:'Paris', type:'Appartement', transaction:'Vente', offerDemand:'Offre', lat:48.8566, lng:2.3522, images:['https://images.unsplash.com/photo-1560185127-6d6d7f0c1949?q=80&w=1200'], description:'Appartement central.' } ]); }
if(!fs.existsSync(CONTACTS_FILE)) writeJson(CONTACTS_FILE, []);
if(!fs.existsSync(RDVS_FILE)) writeJson(RDVS_FILE, []);
if(!fs.existsSync(ADMINS_FILE)){ const defaultPass = process.env.ADMIN_PASS || 'change_me'; const hash = bcrypt.hashSync(defaultPass, 10); writeJson(ADMINS_FILE, [{ user:'admin', passHash: hash }]); console.log('Admin created: user=admin pass=' + (process.env.ADMIN_PASS ? 'from env' : 'change_me')); }

const app = express(); app.use(cors()); app.use(bodyParser.json()); app.use(session({ secret: process.env.SESSION_SECRET || 'turquoise-secret', resave:false, saveUninitialized:true, cookie:{ secure:false } }));
const PUBLIC_DIR = path.join(__dirname, 'public'); app.use(express.static(PUBLIC_DIR));

function adminAuth(req,res,next){ if(req.session && req.session.admin) return next(); return res.status(401).json({ error:'Unauthorized' }); }

app.get('/api/listings',(req,res)=>{ res.json(readJson(LISTINGS_FILE, [])); });
app.get('/api/listings/:id',(req,res)=>{ const data = readJson(LISTINGS_FILE, []); const it = data.find(x=>x.id===req.params.id); if(!it) return res.status(404).json({ error:'Not found' }); res.json(it); });
app.post('/api/listings', adminAuth, (req,res)=>{ const data = readJson(LISTINGS_FILE, []); const payload = req.body; const id = payload.id || (Math.random().toString(36).substr(2,6)).toUpperCase(); const item = Object.assign({ id }, payload); data.push(item); writeJson(LISTINGS_FILE, data); res.json(item); });
app.put('/api/listings/:id', adminAuth, (req,res)=>{ const data = readJson(LISTINGS_FILE, []); const idx = data.findIndex(x=>x.id===req.params.id); if(idx===-1) return res.status(404).json({ error:'Not found' }); data[idx] = Object.assign({}, data[idx], req.body, { id: req.params.id }); writeJson(LISTINGS_FILE, data); res.json(data[idx]); });
app.delete('/api/listings/:id', adminAuth, (req,res)=>{ let data = readJson(LISTINGS_FILE, []); data = data.filter(x=>x.id!==req.params.id); writeJson(LISTINGS_FILE, data); res.json({ ok:true }); });

app.post('/api/contact',(req,res)=>{ const data = readJson(CONTACTS_FILE, []); const payload = req.body; payload.id = uuidv4(); payload.receivedAt = new Date().toISOString(); data.push(payload); writeJson(CONTACTS_FILE, data); res.json({ ok:true }); });
app.post('/api/rdv',(req,res)=>{ const data = readJson(RDVS_FILE, []); const payload = req.body; payload.id = uuidv4(); payload.receivedAt = new Date().toISOString(); data.push(payload); writeJson(RDVS_FILE, data); res.json({ ok:true }); });

app.post('/api/login',(req,res)=>{ const { user, pass } = req.body; const admins = readJson(ADMINS_FILE, []); const found = admins.find(a=>a.user===user); if(!found) return res.status(401).json({ error:'Invalid' }); if(!bcrypt.compareSync(pass, found.passHash)) return res.status(401).json({ error:'Invalid' }); req.session.admin = { user: found.user }; res.json({ ok:true }); });
app.post('/api/logout',(req,res)=>{ req.session.destroy(()=>{ res.json({ ok:true }); }); });
app.get('/api/admin/session',(req,res)=>{ res.json({ auth: !!(req.session && req.session.admin), user: req.session && req.session.admin && req.session.admin.user }); });

const PORT = process.env.PORT || 3000; app.listen(PORT, ()=>{ console.log('Turquoise.Immo server running on port', PORT); });