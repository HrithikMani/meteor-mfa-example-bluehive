// client/main.js
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Tracker } from 'meteor/tracker';
import "./main.html";

// Import all templates (HTML and JS)
import '../templates/layout.html';
import '../templates/layout.js';
import '../templates/login.html';
import '../templates/login.js';
import '../templates/signup.html';
import '../templates/signup.js';
import '../templates/dashboard.html';
import '../templates/dashboard.js';
import '../templates/notFound.html';
import '../templates/notFound.js';

// Add decodeQueryParamsOnce for new apps (recommended)
FlowRouter.decodeQueryParamsOnce = true;

// Login route - only accessible if NOT logged in
FlowRouter.route('/login', {
  name: 'login',
  action() {
    if (Meteor.userId()) {
      // User is logged in, redirect to dashboard
      FlowRouter.go('/dashboard');
    } else {
      // User is not logged in, show login page
      this.render('layout', 'login');
    }
  }
});

// Signup route - only accessible if NOT logged in
FlowRouter.route('/signup', {
  name: 'signup',
  action() {
    if (Meteor.userId()) {
      // User is logged in, redirect to dashboard
      FlowRouter.go('/dashboard');
    } else {
      // User is not logged in, show signup page
      this.render('layout', 'signup');
    }
  }
});

// Dashboard route - only accessible if logged in
FlowRouter.route('/dashboard', {
  name: 'dashboard',
  action() {
    if (!Meteor.userId()) {
      // User is not logged in, redirect to login
      FlowRouter.go('/login');
    } else {
      // User is logged in, show dashboard
      this.render('layout', 'dashboard');
    }
  }
});

// Root route - redirect based on login status
FlowRouter.route('/', {
  name: 'root',
  action() {
    if (Meteor.userId()) {
      // User is logged in, go to dashboard
      FlowRouter.go('/dashboard');
    } else {
      // User is not logged in, go to login
      FlowRouter.go('/login');
    }
  }
});

// 404 route
FlowRouter.route('*', {
  action() {
    this.render('layout', 'notFound');
  }
});

// Handle authentication state changes in real-time
Meteor.startup(() => {
  Tracker.autorun(() => {
    const userId = Meteor.userId();
    const currentRouteName = FlowRouter.getRouteName();
    
    // If user logs out while on dashboard, redirect to login
    if (!userId && currentRouteName === 'dashboard') {
      FlowRouter.go('/login');
    }
    
    // If user logs in while on login/signup, redirect to dashboard
    if (userId && (currentRouteName === 'login' || currentRouteName === 'signup')) {
      FlowRouter.go('/dashboard');
    }
  });
  
  console.log('Meteor Blaze 2FA app routes loaded with authentication!');
});