import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { ServiceConfiguration } from 'meteor/service-configuration';

Meteor.startup(async () => {
  // Configure Google OAuth if settings are provided
  if (Meteor.settings.google) {
    try {
      await ServiceConfiguration.configurations.upsertAsync(
        { service: 'google' },
        {
          $set: {
            clientId: Meteor.settings.google.clientId,
            secret: Meteor.settings.google.clientSecret,
            loginStyle: 'popup'
          }
        }
      );
      console.log('✅ Google OAuth configured successfully');
      console.log('Client ID:', Meteor.settings.google.clientId);
    } catch (error) {
      console.error('❌ Error configuring Google OAuth:', error);
    }
  } else {
    console.warn('⚠️ Google OAuth settings not found in Meteor.settings');
    console.log('Expected structure: { google: { clientId: "...", clientSecret: "..." } }');
  }

  // Configure Facebook OAuth if settings are provided
  if (Meteor.settings.facebook) {
    try {
      await ServiceConfiguration.configurations.upsertAsync(
        { service: 'facebook' },
        {
          $set: {
            appId: Meteor.settings.facebook.appId,
            secret: Meteor.settings.facebook.secret,
            loginStyle: 'popup'
          }
        }
      );
      console.log('✅ Facebook OAuth configured successfully');
      console.log('App ID:', Meteor.settings.facebook.appId);
    } catch (error) {
      console.error('❌ Error configuring Facebook OAuth:', error);
    }
  } else {
    console.warn('⚠️ Facebook OAuth settings not found in Meteor.settings');
    console.log('Expected structure: { facebook: { appId: "...", secret: "..." } }');
  }

  // Configure accounts settings
  Accounts.config({
    sendVerificationEmail: false,
    forbidClientAccountCreation: false,
    loginExpirationInDays: 30,
  });

  // Set up login hook to handle post-login logic
  Accounts.onLogin((loginInfo) => {
    console.log('User logged in:', loginInfo.user._id);
    
    // Log which service was used for login
    if (loginInfo.user.services.google) {
      console.log('Logged in via Google:', loginInfo.user.services.google.email);
    }
    if (loginInfo.user.services.facebook) {
      console.log('Logged in via Facebook:', loginInfo.user.services.facebook.name);
    }
    
    // You can add any additional post-login logic here
  });

  console.log('✅ OAuth configuration completed!');
});