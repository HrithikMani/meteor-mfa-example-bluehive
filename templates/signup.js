// client/templates/signup.js
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import './signup.html';

Template.signup.events({
  'click .go-to-login'(event) {
    event.preventDefault();
    FlowRouter.go('/login');
  }
});