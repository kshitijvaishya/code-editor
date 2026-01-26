# Quick Start Guide

## For Local Development (Fastest)

1. **Install MongoDB locally:**
   ```powershell
   # Download from: https://www.mongodb.com/try/download/community
   # Install and start as Windows service
   ```

2. **Clone and setup:**
   ```powershell
   cd code-editor
   npm install
   ```

3. **Create `.env.local` file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/code-editor
   ```

4. **Run:**
   ```powershell
   npm run dev
   ```

5. **Open:** http://localhost:3000

## For Cloud Development (No local MongoDB)

1. **Create MongoDB Atlas account (free):**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Create M0 (free) cluster
   - Whitelist your IP (0.0.0.0/0 for development)
   - Create database user

2. **Setup project:**
   ```powershell
   cd code-editor
   npm install
   ```

3. **Create `.env.local` file with Atlas URI:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/code-editor
   ```

4. **Run:**
   ```powershell
   npm run dev
   ```

5. **Open:** http://localhost:3000

## Verify MongoDB Connection

When you start the app, you should see:
```
Database indexes initialized successfully
```

If you see connection errors, check:
- MongoDB service is running (local)
- Connection string is correct in `.env.local`
- IP is whitelisted (Atlas)
- Database user credentials are correct (Atlas)

## Troubleshooting

### "Cannot connect to MongoDB"
- **Local:** Run `net start MongoDB` in PowerShell as Administrator
- **Atlas:** Check Network Access settings and whitelist IP

### "Authentication failed"
- Verify username and password in connection string
- Ensure database user has read/write permissions

### Port 3000 already in use
```powershell
npm run dev -- -p 3001
```

For detailed setup instructions, see [MONGODB_SETUP.md](MONGODB_SETUP.md)
