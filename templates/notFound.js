// client/templates/notFound.js
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';

import './notFound.html';

Template.notFound.events({
  'click .go-home'(event) {
    event.preventDefault();
    FlowRouter.go('/');
  }
});