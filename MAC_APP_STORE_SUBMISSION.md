# Mac App Store Submission Guide for DailyNotes

## ✅ All Compliance Changes Complete

Your app is now ready for Mac App Store submission! All critical security and privacy issues have been addressed.

---

## 📋 Changes Summary

### Security Improvements ✅
- ✅ Electron security hardened: `contextIsolation: true`, `nodeIntegration: false`
- ✅ Preload script implemented for safe IPC communication
- ✅ Sandbox enabled with proper entitlements
- ✅ All file operations use system dialogs (user consent required)

### Privacy & Compliance ✅
- ✅ All telemetry removed (no data collection)
- ✅ Privacy statement added to Settings UI
- ✅ No network connections (telemetry host removed)
- ✅ User controls notes directory location

### Removed Risk Factors ✅
- ✅ Terminal access removed
- ✅ Arbitrary executable execution removed (execFile)
- ✅ Unused ollama dependency removed
- ✅ Custom editor path configuration removed

---

## 🚀 Build & Submit Process

### Step 1: Update Author Information
Edit `package.json` and update:
```json
"author": {
  "name": "Your Real Name",
  "email": "your-email@example.com"
}
```

### Step 2: Update App ID
In `package.json`, change the `appId` to your registered Bundle ID:
```json
"build": {
  "appId": "com.yourcompany.dailynotes"
}
```

### Step 3: Prepare Certificates
You need these from Apple Developer:
1. **Mac App Distribution certificate** - for signing
2. **Mac Installer Distribution certificate** - for pkg
3. **Mac App Store provisioning profile** - download and rename to `embedded.provisionprofile`

Place `embedded.provisionprofile` in the project root directory.

### Step 4: Build for Mac App Store
```bash
# Development build (for testing on registered devices)
npm run build:mas-dev

# Production build (for App Store submission)
npm run build:mas
```

The built app will be in `dist/mas/` directory.

### Step 5: Test the App
Before submission, thoroughly test:
- ✅ Create new daily notes
- ✅ Generate reports (weekly, monthly)
- ✅ Search functionality
- ✅ Settings page (all options)
- ✅ Change notes directory
- ✅ Calendar and list views
- ✅ User-defined files

### Step 6: Upload to App Store Connect

#### Using Transporter App (Recommended):
1. Open **Transporter** (download from Mac App Store)
2. Sign in with your Apple Developer account
3. Drag the `.pkg` file from `dist/mas/` to Transporter
4. Click "Deliver"

#### Using Command Line:
```bash
xcrun altool --upload-app \
  --type osx \
  --file "dist/mas/DailyNotes-1.10.pkg" \
  --username "your-apple-id@example.com" \
  --password "your-app-specific-password"
```

---

## 📝 App Store Connect Configuration

### App Information
- **Category**: Productivity
- **Subcategory**: (optional)
- **Age Rating**: 4+ (no objectionable content)

### Privacy Questions (Most Important!)

**Does your app collect data?**
- Select: **No, this app does not collect data**

If asked for specific data types, select "No" for all categories:
- ❌ Contact Info
- ❌ Health & Fitness  
- ❌ Financial Info
- ❌ Location
- ❌ Sensitive Info
- ❌ Contacts
- ❌ User Content
- ❌ Browsing History
- ❌ Search History
- ❌ Identifiers
- ❌ Purchases
- ❌ Usage Data
- ❌ Diagnostics
- ❌ Other Data

**Privacy Policy URL**: (optional, but recommended)
- Create a simple page stating: "DailyNotes stores all data locally on your device. No data is collected, transmitted, or shared with any third parties."

### App Description (Example)
```
DailyNotes - Simple & Powerful Daily Note-Taking

Stay organized with automatic daily note creation and intelligent reporting.

FEATURES:
• Automatic daily note creation
• Smart tag-based organization (#todo, #note, #meeting)
• Automated weekly/monthly reports
• Calendar view of your notes
• Powerful full-text search
• Completely local - your data stays on your device
• Privacy-focused - no cloud sync, no tracking

PRIVACY FIRST:
All your notes are stored locally on your Mac. No data is ever uploaded to any server. You have complete control over your content.

PERFECT FOR:
• Daily journaling
• Task management
• Meeting notes
• Project documentation
• Personal knowledge base

Your notes, your privacy, your control.
```

### Screenshots Required
You'll need at least 3 screenshots. Recommended:
1. Main tray menu showing features
2. Calendar view
3. Settings page with privacy notice

Screenshot sizes for Mac:
- 1280 x 800 pixels (minimum)
- 2880 x 1800 pixels (recommended for Retina)

### Keywords (Max 100 characters)
```
notes,journal,todo,productivity,markdown,daily,private,local
```

---

## ⚠️ Common Review Issues & Solutions

### Issue: "App Uses Deprecated APIs"
**Solution**: Already addressed - we're using latest Electron security practices

### Issue: "Privacy Policy Missing"
**Solution**: Add a simple privacy page URL in App Store Connect stating data is local-only

### Issue: "App Accesses User Data Without Permission"
**Solution**: Already fixed - directory selection uses system dialog with user consent

### Issue: "Network Activity Detected"
**Solution**: Already fixed - all telemetry removed, network client entitlement set to false

### Issue: "Sandbox Violations"
**Solution**: Already configured - proper entitlements in place

---

## 🔧 Troubleshooting Build Issues

### "Code signing failed"
```bash
# List available identities
security find-identity -v -p codesigning

# Make sure you have "3rd Party Mac Developer Application" and "3rd Party Mac Developer Installer"
```

### "Provisioning profile not found"
- Download the profile from developer.apple.com
- Rename it to `embedded.provisionprofile`
- Place it in the project root

### "Entitlements rejected"
- Make sure `entitlements.mas.plist` and `entitlements.mas.inherit.plist` are present
- Verify they match your App ID capabilities in Apple Developer portal

---

## 📞 Additional Resources

- **Apple Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Mac App Store Requirements**: https://developer.apple.com/macos/submit/
- **Electron Builder Docs**: https://www.electron.build/
- **App Sandbox Guide**: https://developer.apple.com/documentation/security/app_sandbox

---

## ✨ Final Checklist Before Submission

- [ ] Updated author name and email in package.json
- [ ] Changed appId to your registered Bundle ID
- [ ] Downloaded and placed provisioning profile
- [ ] Built and tested the app locally
- [ ] Prepared screenshots (at least 3)
- [ ] Written app description
- [ ] Filled privacy questionnaire (No data collection)
- [ ] Set pricing (Free or Paid)
- [ ] Uploaded build via Transporter
- [ ] Selected build in App Store Connect
- [ ] Submitted for review

---

## 🎉 You're Ready!

All code changes are complete. Your app now meets Mac App Store requirements:
- ✅ No privacy violations
- ✅ Proper sandboxing
- ✅ Secure IPC communication
- ✅ No arbitrary code execution
- ✅ User consent for file access

Good luck with your submission! 🚀
