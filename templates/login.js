// client/templates/login.js
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import './login.html';

Template.login.events({
  'click .go-to-signup'(event) {
    event.preventDefault();
    FlowRouter.go('/signup');
  }
});