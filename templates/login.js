// client/templates/login.js
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';

import './login.html';

// Reactive variables for managing state
const showTwoFactorInput = new ReactiveVar(false);
const loginCredentials = new ReactiveVar({});
const errorMessage = new ReactiveVar('');

Template.login.onCreated(function() {
  // Reset state when template is created
  showTwoFactorInput.set(false);
  loginCredentials.set({});
  errorMessage.set('');
});

Template.login.helpers({
  showTwoFactorInput() {
    return showTwoFactorInput.get();
  },
  
  loginUsername() {
    return loginCredentials.get().username;
  },
  
  inputUsername() {
    return loginCredentials.get().username || '';
  },
  
  errorMessage() {
    return errorMessage.get();
  }
});

Template.login.events({

    'click .facebook-button'(event) {
    event.preventDefault();
    // Handle Facebook login
     Meteor.loginWithFacebook({
            requestPermissions: ['email', 'public_profile'],
            loginStyle: 'popup'
        }, (error, result) => {
            if (error) {
                console.log('Facebook login error:', error);
                errorMessage.set('Facebook login failed. Please try again.');
            } else {
                console.log('Facebook login successful');
            }
        });
  },
  'click .google-button'(event) {
    event.preventDefault();
    // Handle Google login
    Meteor.loginWithGoogle((error) => {
      if (error) {
        console.log('Google login error:', error);
        errorMessage.set('Google login failed. Please try again.');
      } else {
        console.log('Google login successful');
      }
    });
  },
  'submit .login-form'(event) {
    event.preventDefault();
    
    const form = event.target;
    const username = form.username.value.trim();
    const password = form.password.value;
    
    // Clear previous error
    errorMessage.set('');
    
    // Basic validation
    if (!username || !password) {
      errorMessage.set('Please enter both username/email and password');
      return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const spinner = submitBtn.querySelector('.spinner');
    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    
    // Store credentials for potential 2FA use
    loginCredentials.set({ username, password });
    
    // Attempt login
    Meteor.loginWithPassword(username, password, (error) => {
      // Reset loading state
      submitBtn.disabled = false;
      spinner.style.display = 'none';
      
      if (error) {
        console.log('Login error:', error);
        
        if (error.error === "no-2fa-code") {
          // User has 2FA enabled, show 2FA input
          showTwoFactorInput.set(true);
          errorMessage.set('');
          
          // Focus on 2FA input after template updates
          Meteor.setTimeout(() => {
            const twoFactorInput = document.getElementById('twoFactorCode');
            if (twoFactorInput) {
              twoFactorInput.focus();
            }
          }, 100);
        } else {
          // Handle other login errors
          let message = 'Login failed. Please check your credentials.';
          
          if (error.reason) {
            if (error.reason.includes('User not found')) {
              message = 'No account found with that username or email.';
            } else if (error.reason.includes('Incorrect password')) {
              message = 'Incorrect password. Please try again.';
            } else {
              message = error.reason;
            }
          }
          
          errorMessage.set(message);
        }
      } else {
        // Login successful - redirect will happen automatically via router
        console.log('Login successful');
      }
    });
  },
  
  'submit .two-factor-form'(event) {
    event.preventDefault();
    
    const form = event.target;
    const twoFactorCode = form.twoFactorCode.value.trim();
    const credentials = loginCredentials.get();
    
    // Clear previous error
    errorMessage.set('');
    
    // Validate 2FA code
    if (!twoFactorCode) {
      errorMessage.set('Please enter the 6-digit authentication code');
      return;
    }
    
    if (!/^\d{6}$/.test(twoFactorCode)) {
      errorMessage.set('Please enter a valid 6-digit code');
      return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const spinner = submitBtn.querySelector('.spinner');
    submitBtn.disabled = true;
    spinner.style.display = 'inline-block';
    
    // Attempt login with 2FA code
    Meteor.loginWithPasswordAnd2faCode(
      credentials.username,
      credentials.password,
      twoFactorCode,
      (error) => {
        // Reset loading state
        submitBtn.disabled = false;
        spinner.style.display = 'none';
        
        if (error) {
          console.log('2FA login error:', error);
          
          let message = 'Authentication failed. Please try again.';
          
          if (error.reason) {
            if (error.reason.includes('Invalid login token')) {
              message = 'Invalid or expired authentication code. Please try again.';
            } else if (error.reason.includes('User has no 2FA enabled')) {
              message = 'Two-factor authentication is not enabled for this account.';
            } else {
              message = error.reason;
            }
          }
          
          errorMessage.set(message);
          
          // Clear the 2FA code input
          form.twoFactorCode.value = '';
          form.twoFactorCode.focus();
        } else {
          // Login successful - redirect will happen automatically via router
          console.log('2FA login successful');
        }
      }
    );
  },
  
  'click .cancel-2fa-btn'(event) {
    event.preventDefault();
    
    // Reset to normal login form
    showTwoFactorInput.set(false);
    loginCredentials.set({});
    errorMessage.set('');
    
    // Clear form fields
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
      loginForm.reset();
    }
  },
  
  'click .go-to-signup'(event) {
    event.preventDefault();
    FlowRouter.go('/signup');
  },
  
  'input #twoFactorCode'(event) {
    // Clear error when user starts typing
    if (errorMessage.get()) {
      errorMessage.set('');
    }
    
    // Auto-format: only allow numbers and limit to 6 digits
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    event.target.value = value;
    
    // Auto-submit when 6 digits are entered
    if (value.length === 6) {
      Meteor.setTimeout(() => {
        const form = document.querySelector('.two-factor-form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true }));
        }
      }, 300); // Small delay for better UX
    }
  },
  
  'input #username, input #password'(event) {
    // Clear error when user starts typing in login form
    if (errorMessage.get()) {
      errorMessage.set('');
    }
  }
});