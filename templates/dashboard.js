// client/templates/dashboard.js
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';

import './dashboard.html';

Template.dashboard.onCreated(function() {
  this.isRefreshing = new ReactiveVar(false);
});

Template.dashboard.helpers({
  userInfo() {
    const user = Meteor.user();
    if (!user) return {};
    
    return {
      username: user.username || 'Not set',
      email: (user.emails && user.emails[0] && user.emails[0].address) || 'Not set',
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Unknown',
      lastLogin: (user.services && user.services.resume && user.services.resume.loginTokens && user.services.resume.loginTokens.length > 0) ?
        new Date(user.services.resume.loginTokens[user.services.resume.loginTokens.length - 1].when).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'This session'
    };
  },
  
  isRefreshing() {
    return Template.instance().isRefreshing.get();
  }
});

Template.dashboard.events({
  'click .logout-btn'(event) {
    event.preventDefault();
    
    // Use a more user-friendly confirmation
    const confirmLogout = confirm('Are you sure you want to log out?');
    
    if (confirmLogout) {
      Meteor.logout((error) => {
        if (error) {
          console.error('Logout error:', error);
          alert('Error logging out. Please try again.');
        } else {
          console.log('Successfully logged out');
          // Router will automatically redirect to login page
        }
      });
    }
  },
  
  'click .refresh-btn, click button:contains("Refresh")'(event, template) {
    event.preventDefault();
    
    template.isRefreshing.set(true);
    
    // Simulate refresh by re-subscribing to user data
    // In a real app, you might refresh subscriptions here
    setTimeout(() => {
      template.isRefreshing.set(false);
      console.log('Dashboard refreshed');
    }, 1000);
  },
  
  'click .auth-button.primary:contains("Enable 2FA")'(event) {
    event.preventDefault();
    
    // TODO: Implement 2FA setup
    alert('2FA setup will be implemented next! This will show a QR code for your authenticator app.');
    
    // Placeholder for 2FA setup flow
    console.log('Starting 2FA setup flow...');
  }
});