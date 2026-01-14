---
description: Deploy the application to a Hostinger VPS
---

This workflow guides you through deploying the FuelPay application to a Hostinger VPS.

# Prerequisites
- A Hostinger VPS running Ubuntu (20.04 or 22.04 recommended).
- SSH access to the VPS.
- A domain/subdomain pointing to your VPS IP address (IPv4 and/or IPv6).

# Steps

# Quick Update (Existing Deployment)
If you have already set up the server and just want to deploy new changes:

1. **Local Machine**: Push your changes
   ```bash
   git add .
   git commit -m "update: your message here"
   git push origin main
   ```

2. **VPS**: Pull and Restart
   ```bash
   cd fuel-pay
   git pull origin main
   npm ci
   npm run build
   pm2 restart fuel-pay
   ```

# Complete Setup (New Deployment)

1. **Update System Packages**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Node.js (LTS)**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install Git and PM2**
   ```bash
   sudo apt install -y git
   sudo npm install -g pm2
   ```

4. **Clone the Repository**
   Replace `<your-repo-url>` with your actual GitHub repository URL.
   ```bash
   git clone <your-repo-url> fuel-pay
   cd fuel-pay
   ```

5. **Install Dependencies**
   ```bash
   npm ci
   ```

6. **Build the Application**
   ```bash
   npm run build
   ```

7. **Configure Environment Variables**
   Create or update the `.env` file with the required variables:
   ```bash
   nano .env
   ```
   Add the following content (adjust values as needed):
   ```env
   PORT=5000
   NODE_ENV=production
   DATABASE_URL=postgresql://username:password@localhost:5432/fuelpay
   SESSION_SECRET=create_a_long_random_string_here
   ```
   *Note: Ensure your database is provisioned and accessible at the DATABASE_URL.*

8. **Start/Restart with PM2**
   If starting for the first time:
   ```bash
   pm2 start npm --name "fuel-pay" -- run start
   ```
   If restarting:
   ```bash
   pm2 restart fuel-pay
   ```
   Save the PM2 list to resurrect on reboot:
   ```bash
   pm2 save
   pm2 startup
   ```

9. **Configure Firewall**
   Allow the application port (if not using Nginx) or SSH/HTTP/HTTPS:
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 5000/tcp
   sudo ufw enable
   ```

10. **(Optional) Setup Nginx Reverse Proxy**
    Install Nginx:
    ```bash
    sudo apt install -y nginx
    ```
    Create a config block (e.g., `/etc/nginx/sites-available/fuel-pay`) to forward port 80/443 to 5000.
    Enable it and restart Nginx.
