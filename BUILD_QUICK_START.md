# Quick Reference - Mac App Store Build

## Before First Build

1. **Update package.json author info:**
   ```json
   "author": {
     "name": "Your Name",
     "email": "your@email.com"
   },
   "build": {
     "appId": "com.yourcompany.dailynotes"
   }
   ```

2. **Get certificates from Apple Developer:**
   - Mac App Distribution certificate
   - Mac Installer Distribution certificate
   - Mac App Store provisioning profile → rename to `embedded.provisionprofile`

3. **Install dependencies:**
   ```bash
   npm install
   ```

## Development & Testing

```bash
# Run app locally
npm start

# Build for local testing
npm run package
```

## Build for App Store

```bash
# Development build (testing on registered devices)
npm run build:mas-dev

# Production build (for submission)
npm run build:mas
```

Output: `dist/mas/DailyNotes-1.10.pkg`

## Upload to App Store

**Option 1: Transporter App (Easy)**
1. Download Transporter from Mac App Store
2. Drag the .pkg file into Transporter
3. Click "Deliver"

**Option 2: Command Line**
```bash
xcrun altool --upload-app \
  --type osx \
  --file "dist/mas/DailyNotes-1.10.pkg" \
  --username "apple-id@example.com" \
  --password "app-specific-password"
```

## App Privacy Settings

In App Store Connect, answer:
- **Collects data?** → NO
- **All data type questions** → NO

## Support

See `MAC_APP_STORE_SUBMISSION.md` for detailed guide.
