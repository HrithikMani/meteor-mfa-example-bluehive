// client/templates/signup.js
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';

import './signup.html';

// Create reactive variables for form state
Template.signup.onCreated(function() {
  this.isLoading = new ReactiveVar(false);
  this.errorMessage = new ReactiveVar('');
  this.successMessage = new ReactiveVar('');
});

Template.signup.helpers({
  isLoading() {
    return Template.instance().isLoading.get();
  },
  
  errorMessage() {
    return Template.instance().errorMessage.get();
  },
  
  successMessage() {
    return Template.instance().successMessage.get();
  }
});

Template.signup.events({
  'submit .auth-form'(event, template) {
    event.preventDefault();
    
    // Clear any previous messages
    template.errorMessage.set('');
    template.successMessage.set('');
    template.isLoading.set(true);
    
    // Get form data
    const target = event.target;
    const username = target.username.value.trim();
    const email = target.email.value.trim();
    const password = target.password.value;
    const confirmPassword = target.confirmPassword.value;
    
    // Validation
    const validationError = validateSignupForm(username, email, password, confirmPassword);
    if (validationError) {
      template.errorMessage.set(validationError);
      template.isLoading.set(false);
      return;
    }
    
    // Create user account
    const userData = {
      username: username,
      email: email,
      password: password
    };
    
    Accounts.createUserAsync(userData, (error) => {
      template.isLoading.set(false);
      
      if (error) {
        console.error('Signup error:', error);
        
        // Handle specific error types
        switch (error.error) {
          case 403:
            if (error.reason.includes('Username already exists')) {
              template.errorMessage.set('Username is already taken. Please choose a different one.');
            } else if (error.reason.includes('Email already exists')) {
              template.errorMessage.set('An account with this email already exists.');
            } else {
              template.errorMessage.set(error.reason);
            }
            break;
          case 400:
            template.errorMessage.set('Please check your information and try again');
            break;
          default:
            template.errorMessage.set(error.reason || 'Account creation failed. Please try again.');
        }
      } else {
        // Account created successfully and user is automatically logged in
        console.log('Account created successfully');
        template.successMessage.set('Account created successfully! Redirecting to dashboard...');
        
        // Clear form
        target.reset();
        
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          FlowRouter.go('/dashboard');
        }, 1500);
      }
    });
  },
  
  'click .go-to-login'(event) {
    event.preventDefault();
    FlowRouter.go('/login');
  },
  
  // Clear messages when user starts typing
  'input input'(event, template) {
    if (template.errorMessage.get() || template.successMessage.get()) {
      template.errorMessage.set('');
      template.successMessage.set('');
    }
  }
});

// Validation function
function validateSignupForm(username, email, password, confirmPassword) {
  if (!username || !email || !password || !confirmPassword) {
    return 'Please fill in all fields';
  }
  
  if (username.length < 3) {
    return 'Username must be at least 3 characters long';
  }
  
  if (username.length > 30) {
    return 'Username must be less than 30 characters';
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  // Check for basic password strength
  if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  
  return null; // No validation errors
}