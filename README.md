# Meteor OAuth + 2FA Demo

A complete implementation demonstrating OAuth providers with 2FA integration using the new `loginWithExternalServiceAnd2fa` method from [PR #13906](https://github.com/meteor/meteor/pull/13906).

## 🚀 Quick Start

```bash
git clone https://github.com/bluehive-health/meteor-mfa-example
cd meteor-mfa-example
meteor npm install
meteor run
```

Visit `http://localhost:3000` and create an account or configure OAuth providers.

## ✨ Features

### OAuth Integration
- **Google OAuth** with 2FA support
- **Facebook OAuth** with 2FA support
- Seamless popup/redirect authentication

### 2FA Implementation
Built on Meteor's native 2FA system with new OAuth + 2FA integration:

```javascript
// NEW: OAuth + 2FA Login (from PR #13906)
Meteor.loginWithExternalServiceAnd2fa(credentialToken, otpCode, callback);

// Standard 2FA Methods
Accounts.generate2faActivationQrCode("App Name", callback);
Accounts.enableUser2fa(verificationCode, callback);
Accounts.has2faEnabled(callback);
Accounts.disableUser2fa(callback);
Meteor.loginWithPasswordAnd2faCode(user, password, code, callback);
```

### UI Components
- Clean login/signup flow
- QR code generation for authenticator apps
- Real-time 2FA verification
- Responsive dashboard with security settings

## 🛠 OAuth Setup

Create `settings.json`:
```json
{
  "google": {
    "clientId": "your-google-client-id",
    "clientSecret": "your-google-client-secret"
  },
  "facebook": {
    "appId": "your-facebook-app-id", 
    "secret": "your-facebook-secret"
  }
}
```

Run with: `meteor run --settings settings.json`

## 🔐 2FA Flow

1. **Standard Login** → User enters credentials
2. **2FA Challenge** → If enabled, shows 2FA prompt
3. **OAuth Login** → External service redirects with credential token
4. **2FA Required** → If user has 2FA enabled, collect OTP code
5. **Complete Login** → Verify OTP and log in user

## 📱 Authenticator Apps

Works with:
- Google Authenticator
- Authy
- 1Password
- Microsoft Authenticator
- Any TOTP-compatible app

## 🎯 Key Implementation

This demo implements the **OAuth + 2FA integration** from [Meteor PR #13906](https://github.com/meteor/meteor/pull/13906), specifically the new `loginWithExternalServiceAnd2fa` method that enables seamless 2FA verification after OAuth authentication.

The implementation handles:
- OAuth credential temporary storage during 2FA challenge
- New `loginWithExternalServiceAnd2fa` method integration
- Secure token-based verification flow  
- Automatic cleanup of expired challenges
- Error handling for various failure scenarios
