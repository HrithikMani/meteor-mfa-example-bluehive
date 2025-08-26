// client/templates/dashboard.js
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import './dashboard.html';

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
      lastLogin: (user.services && user.services.resume && user.services.resume.loginTokens && user.services.resume.loginTokens[0]) ?
        new Date(user.services.resume.loginTokens[0].when).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : 'Unknown'
    };
  }
});

Template.dashboard.events({
  'click .logout-btn'(event) {
    event.preventDefault();
    if (confirm('Are you sure you want to log out?')) {
      Meteor.logout((error) => {
        if (error) {
          console.error('Logout error:', error);
        } else {
          FlowRouter.go('/login');
        }
      });
    }
  }
});