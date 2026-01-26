# MongoDB Setup for Code Editor

This project uses MongoDB as its database. Follow the steps below to set up MongoDB for local development or connect to MongoDB Atlas.

## Option 1: Local MongoDB Setup

### Installation

1. **Download and Install MongoDB Community Server**
   - Visit: https://www.mongodb.com/try/download/community
   - Download the installer for Windows
   - Run the installer and follow the installation wizard
   - Install MongoDB as a Windows Service (recommended)

2. **Verify Installation**
   ```powershell
   mongod --version
   ```

3. **Start MongoDB Service**
   - MongoDB should start automatically as a Windows service
   - To manually start: Open Services app and start "MongoDB" service
   - Or run: `net start MongoDB`

4. **Connect to Local MongoDB**
   - Update `.env.local` file:
   ```
   MONGODB_URI=mongodb://localhost:27017/code-editor
   ```

## Option 2: MongoDB Atlas (Cloud)

### Setup

1. **Create a Free MongoDB Atlas Account**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create a Cluster**
   - Create a new M0 (Free tier) cluster
   - Choose your preferred cloud provider and region
   - Wait for the cluster to be created (2-5 minutes)

3. **Configure Network Access**
   - Go to "Network Access" in the Atlas dashboard
   - Click "Add IP Address"
   - Either add your current IP or allow access from anywhere (0.0.0.0/0) for development

4. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create a user with username and password
   - Grant "Read and write to any database" privileges

5. **Get Connection String**
   - Go to "Clusters" and click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Update `.env.local` file:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/code-editor?retryWrites=true&w=majority
   ```

## Environment Variables

Create a `.env.local` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/code-editor
```

**Note:** `.env.local` is already added to `.gitignore` and will not be committed to version control.

## Running the Application

1. Install dependencies:
   ```powershell
   npm install
   ```

2. Start the development server:
   ```powershell
   npm run dev
   ```

The application will connect to MongoDB automatically on startup.

## Database Collections

The application uses the following collections:

- `contests` - Stores contest information, participants, and join codes

## Troubleshooting

### Connection Issues

- **Local MongoDB:** Ensure MongoDB service is running
- **MongoDB Atlas:** Verify IP whitelist and credentials
- **Both:** Check if `MONGODB_URI` is correctly set in `.env.local`

### Common Errors

1. **"MongoServerError: Authentication failed"**
   - Check your username and password in the connection string
   - Ensure the database user has proper permissions

2. **"MongooseServerSelectionError"**
   - Verify MongoDB service is running (local)
   - Check network access settings (Atlas)
   - Verify connection string format

3. **"Cannot find module 'mongodb'"**
   - Run `npm install` to install dependencies

## Additional Tools

### MongoDB Compass (GUI)

Download MongoDB Compass for a visual interface:
- https://www.mongodb.com/products/compass
- Connect using your MongoDB URI

### MongoDB Shell (mongosh)

Install for command-line access:
- https://www.mongodb.com/try/download/shell
- Connect: `mongosh "your-connection-string"`
