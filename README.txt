Turquoise.Immo — projet complet (local + déploiement)
--------------------------------------------------

Contenu:
- public/ (frontend)
- server.js (backend)
- package.json
- data/ (json storage)
- start.bat (Windows auto-start)
- Dockerfile, render.yaml, railway.json (déploiement)
- README.txt (instructions)

Tester en local (Windows):
1) Dézippez le fichier et placez le dossier sur votre PC.
2) Double-cliquez sur start.bat — il va exécuter npm install, démarrer le serveur et ouvrir le navigateur.
3) Site public: http://localhost:3000
   Admin: http://localhost:3000/admin.html
   Identifiants par défaut: admin / change_me

Déploiement (Render / Railway):
- Voir render.yaml / railway.json fournis. Connectez un repo GitHub contenant ce projet et suivez l'interface de Render/Railway.

Sécurité: changez ADMIN_PASS et SESSION_SECRET en variables d'environnement en production.
