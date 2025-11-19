
YS CRM — server package for Render.com deployment (prototype)
Files:
- server.js
- package.json
- /static (frontend)
- /db/init.sql
- /data/db.sqlite (will be created automatically on first run)
- /static/screenshots (your uploaded screenshots)

Quick deploy to Render (without domain):
1. Go to https://render.com and Sign Up / Log In.
2. From Render dashboard: New -> Web Service -> Connect a repo OR "Deploy from a Git repo".
   If you don't want Git, you can create a new service and upload this project as source (zip).
3. Set:
   - Environment: Node
   - Build Command: npm install
   - Start Command: node server.js
4. Choose Free plan and create.
5. After deployment, open the provided URL. The app will be reachable online.

Notes:
- For production you should enable HTTPS, use a persistent DB (Postgres), and add secure auth.
- To change initial users/orders edit /db/init.sql and re-deploy.
