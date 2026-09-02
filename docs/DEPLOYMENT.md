# Deployment

Master Chef has three deploy targets:

| Target | What | How |
|---|---|---|
| **Netlify** | Frontend (static HTML/CSS/JS) | Auto-deploys from GitHub on push to `main`. No build step. |
| **GCP VM** | The PocketBase server | Created once, by hand (below). |
| **Migrations** | `pb_migrations/*.js` (schema) | Deployed **manually** with `./deploy-migrations.sh` when the schema changes. |

- Live frontend: https://mcc-recipe.netlify.app
- Backend API: https://mcc-pb.carwbrown.com  (served by PocketBase on the GCP VM)
- GCP project: `master-chef-backend` · VM: `pocketbase-vm` · zone: `us-central1-a`

> HTTPS is required: the Netlify site is served over https, and browsers block an
> https page from calling an http backend (mixed content). PocketBase auto-issues a
> Let's Encrypt cert for `mcc-pb.carwbrown.com` on boot — the only requirement is a
> DNS A record pointing that host at the VM's static IP.

---

## One-time GCP setup

### 1. Reopen billing (Console)
Billing → **Account management** → **Reopen billing account**.
Billing account ID: `01FCBE-559CCC-07799A`.

### 2. Link billing + enable Compute
```
gcloud billing projects link master-chef-backend --billing-account=01FCBE-559CCC-07799A
gcloud services enable compute.googleapis.com --project=master-chef-backend
```

### 3. Reserve a static IP
```
gcloud compute addresses create pocketbase-ip --region=us-central1 --project=master-chef-backend
gcloud compute addresses describe pocketbase-ip --region=us-central1 --project=master-chef-backend --format="value(address)"
```

### 4. Create the always-free VM (e2-micro)
```
gcloud compute instances create pocketbase-vm \
  --project=master-chef-backend \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=debian-12 --image-project=debian-cloud \
  --boot-disk-size=30GB --boot-disk-type=pd-standard \
  --address=pocketbase-ip \
  --tags=http-server,https-server
```

### 5. Open ports 80 + 443
```
gcloud compute firewall-rules create allow-web \
  --project=master-chef-backend \
  --allow=tcp:80,tcp:443 \
  --target-tags=http-server,https-server \
  --direction=INGRESS
```

### 6. DNS (Namecheap)
carwbrown.com is registered and its DNS is managed at **Namecheap** (the app itself is
hosted on Netlify — separate concern). Add the subdomain record at Namecheap:

Namecheap → Domain List → **Manage** carwbrown.com → **Advanced DNS** → **Add New Record**:
- **Type:** `A Record`
- **Host:** `mcc-pb`
- **Value:** the static IP from step 3
- **TTL:** Automatic

Save. Verify (DNS can take a few minutes to an hour):
```
dig +short mcc-pb.carwbrown.com
```
It should return the static IP.

> Caveat: if Advanced DNS shows **"Custom DNS"** with Netlify nameservers (e.g.
> `dns1.p0X.nsone.net`), then DNS is delegated to Netlify — in that case add the same
> A record in Netlify (Domains → carwbrown.com → DNS settings) instead. Check which one
> is authoritative with: `dig +short NS carwbrown.com`.

### 7. Install PocketBase on the VM
```
gcloud compute ssh pocketbase-vm --zone=us-central1-a --project=master-chef-backend
```
Then, on the VM (matches local PocketBase 0.36.6):
```
sudo mkdir -p /opt/pocketbase && cd /opt/pocketbase
sudo wget -q https://github.com/pocketbase/pocketbase/releases/download/v0.36.6/pocketbase_0.36.6_linux_amd64.zip
sudo unzip -o pocketbase_0.36.6_linux_amd64.zip
sudo rm pocketbase_0.36.6_linux_amd64.zip
```

### 8. systemd service with auto-HTTPS
On the VM:
```
sudo tee /etc/systemd/system/pocketbase.service > /dev/null <<'EOF'
[Unit]
Description=PocketBase
After=network.target
[Service]
Type=simple
User=root
ExecStart=/opt/pocketbase/pocketbase serve mcc-pb.carwbrown.com --dir=/opt/pocketbase/pb_data --migrationsDir=/opt/pocketbase/pb_migrations
Restart=always
[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable --now pocketbase
```

### 9. Create the superuser + the two logins
On the VM:
```
/opt/pocketbase/pocketbase superuser create carwbrown@gmail.com 'STRONG_PASSWORD' --dir=/opt/pocketbase/pb_data
```
Then open https://mcc-pb.carwbrown.com/_/ and, in the `users` collection, create the
two accounts: carwbrown@gmail.com and breck.fisher@gmail.com. (The `users` collection
exists once migrations are deployed — see below.)

---

## Deploying schema changes (routine)

Whenever `pb_migrations/` changes, from your Mac:
```
cd ~/github/master-chef
./deploy-migrations.sh
```
This copies `pb_migrations/` to the VM and restarts PocketBase; migrations auto-apply on boot.

Verify they applied:
```
gcloud compute ssh pocketbase-vm --zone=us-central1-a --project=master-chef-backend \
  --command="sudo journalctl -u pocketbase -n 30 --no-pager"
```

## Deploying the frontend (routine)
Just `git push` to `main`. Netlify builds and deploys automatically.

---

## Local development

```
# Terminal 1 — PocketBase (applies pb_migrations on boot)
cd ~/github/master-chef && pocketbase serve
# Admin UI: http://127.0.0.1:8090/_/

# Terminal 2 — frontend
python3 -m http.server 8000
# App: http://localhost:8000
```
`scripts/config.js` auto-selects the local backend on localhost and the production
backend everywhere else.
