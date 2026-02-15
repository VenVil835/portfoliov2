# 🔥 HOT-RELOADABLE ADMIN CREDENTIALS

## ✅ PROBLEM SOLVED

Your admin credentials now **update INSTANTLY** without requiring a server restart!

## 📁 How It Works

The authentication system now reads from `src/admin-credentials.json` on **every login attempt**, instead of using cached environment variables.

## 🚀 Quick Update Methods

### Method 1: Use the Helper Script (EASIEST)

```bash
node update-credentials.js "[username]" "[password]"
```

This will:
- Hash the password with bcrypt
- Update the credentials file
- **Work IMMEDIATELY** - no restart needed!

### Method 2: Manual Edit

1. Open `src/admin-credentials.json`
2. Update the `username` or `passwordHash`:
   ```json
   {
     "username": "",
     "passwordHash": "$2b$10$..."
   }
   ```
3. Save the file
4. **Changes work IMMEDIATELY** on next login!

### Method 3: Generate New Hash

```bash
node -e "console.log(require('bcryptjs').hashSync('yourpassword', 10))"
```

Then paste the hash into `admin-credentials.json`.

## 🔑 Current Credentials

- **Username:** ``
- **Password:** ``

## 🎉 That's It!

No more server restarts. Update credentials anytime and they work instantly!
