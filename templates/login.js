// client/templates/login.js
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';

import './login.html';

// Create reactive variables for form state
Template.login.onCreated(function() {
  this.isLoading = new ReactiveVar(false);
  this.errorMessage = new ReactiveVar('');
});

Template.login.helpers({
  isLoading() {
    return Template.instance().isLoading.get();
  },
  
  errorMessage() {
    return Template.instance().errorMessage.get();
  }
});

Template.login.events({
  'submit .auth-form'(event, template) {
    event.preventDefault();
    
    // Clear any previous errors
    template.errorMessage.set('');
    template.isLoading.set(true);
    
    // Get form data
    const target = event.target;
    const username = target.username.value.trim();
    const password = target.password.value;
    
    // Basic validation
    if (!username || !password) {
      template.errorMessage.set('Please enter both username/email and password');
      template.isLoading.set(false);
      return;
    }
    
    // Attempt login
    Meteor.loginWithPassword(username, password, (error) => {
      template.isLoading.set(false);
      
      if (error) {
        console.error('Login error:', error);
        
        // Handle specific error types
        switch (error.error) {
          case 403:
            template.errorMessage.set('Invalid username/email or password');
            break;
          case 400:
            template.errorMessage.set('Please check your credentials and try again');
            break;
          default:
            template.errorMessage.set(error.reason || 'Login failed. Please try again.');
        }
      } else {
        // Login successful - router will automatically redirect to dashboard
        console.log('Login successful');
        // Clear form
        target.reset();
      }
    });
  },
  
  'click .go-to-signup'(event) {
    event.preventDefault();
    FlowRouter.go('/signup');
  },
  
  'click .google-button'(event) {
    event.preventDefault();
    // TODO: Implement Google OAuth login
    alert('Google OAuth login not yet implemented');
  },
  
  // Clear errors when user starts typing
  'input input'(event, template) {
    if (template.errorMessage.get()) {
      template.errorMessage.set('');
    }
  }
});