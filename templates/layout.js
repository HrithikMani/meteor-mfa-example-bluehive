// client/templates/layout.js
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';

import './layout.html';

Template.layout.helpers({
  userDisplayName() {
    const user = Meteor.user();
    if (user) {
      return user.username || (user.emails && user.emails[0].address) || user.services.google.name || 'User';
    }
    return '';
  }
});