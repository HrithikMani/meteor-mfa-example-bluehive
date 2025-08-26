// client/templates/dashboard.js
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';
import Swal from 'sweetalert2';

import './dashboard.html';


// Create reactive variable to track 2FA status
const twoFactorStatus = new ReactiveVar(false);

// Check 2FA status when template is created
Template.dashboard.onCreated(function() {
  this.autorun(() => {
    if (Meteor.userId()) {
      Accounts.has2faEnabled((error, enabled) => {
        if (!error) {
          twoFactorStatus.set(enabled);
        }
      });
    }
  });
});

Template.dashboard.helpers({
  userInfo() {
    const user = Meteor.user();
    if (!user) return {};
    if(user.services.google){
      return {
        username: user.services.google.name,
        email: user.services.google.email,
         createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Unknown'
    };
  }
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
  },
  
  twoFactorEnabled() {
    return twoFactorStatus.get();
  }
});

Template.dashboard.events({
  'click .refresh-btn'(event) {
    event.preventDefault();
    
    // Show loading
    Swal.fire({
      title: 'Refreshing...',
      text: 'Checking account status',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    // Refresh 2FA status
    Accounts.has2faEnabled((error, enabled) => {
      Swal.close();
      if (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to refresh account status',
          icon: 'error',
          customClass: {
            popup: 'mfa-swal-popup',
            title: 'mfa-swal-title',
            content: 'mfa-swal-content'
          }
        });
      } else {
        twoFactorStatus.set(enabled);
        Swal.fire({
          title: 'Refreshed!',
          text: 'Account status updated',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'mfa-swal-popup',
            title: 'mfa-swal-title',
            content: 'mfa-swal-content'
          }
        });
      }
    });
  },

  'click .enable-2fa-btn'(event) {
    event.preventDefault();
    
    // Step 1: Generate QR Code
    Swal.fire({
      title: 'Enable Two-Factor Authentication',
      text: 'Generating QR code for your authenticator app...',
      allowOutsideClick: false,
      showConfirmButton: false,
      customClass: {
        popup: 'mfa-swal-popup',
        title: 'mfa-swal-title',
        content: 'mfa-swal-content'
      },
      didOpen: () => {
        Swal.showLoading();
      }
    });

    Accounts.generate2faActivationQrCode("Meteor 2FA App", (error, result) => {
      if (error) {
        console.error('Error generating QR code:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to generate QR code. Please try again.',
          icon: 'error',
          customClass: {
            popup: 'mfa-swal-popup',
            title: 'mfa-swal-title',
            content: 'mfa-swal-content'
          }
        });
        return;
      }

      const { svg, secret } = result;
      
      // Step 2: Show QR Code and ask for verification
      Swal.fire({
        title: 'Scan QR Code',
        html: `
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="margin-bottom: 15px; color: #4a5568;">
              Scan this QR code with your authenticator app:
            </p>
            <div style="display: inline-block; padding: 15px; background: white; border-radius: 8px; border: 2px solid #e2e8f0;">
              ${svg}
            </div>
          </div>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: left;">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #2d3748;">Supported Apps:</p>
            <ul style="margin: 0; padding-left: 20px; color: #4a5568; font-size: 14px;">
              <li>Google Authenticator</li>
              <li>Authy</li>
              <li>1Password</li>
              <li>Microsoft Authenticator</li>
            </ul>
          </div>
          <p style="color: #718096; font-size: 14px; margin: 15px 0;">
            After scanning, enter the 6-digit code from your app:
          </p>
        `,
        input: 'text',
        inputPlaceholder: 'Enter 6-digit code',
        inputAttributes: {
          maxlength: 6,
          style: 'text-align: center; font-size: 1.5rem; font-weight: 600; letter-spacing: 0.5em; font-family: monospace;'
        },
        showCancelButton: true,
        confirmButtonText: 'Enable 2FA',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'mfa-swal-popup',
          title: 'mfa-swal-title',
          content: 'mfa-swal-content',
          input: 'mfa-swal-input',
          confirmButton: 'auth-button primary',
          cancelButton: 'auth-button secondary'
        },
        preConfirm: (code) => {
          if (!code) {
            Swal.showValidationMessage('Please enter the 6-digit code');
            return false;
          }
          if (!/^\d{6}$/.test(code)) {
            Swal.showValidationMessage('Please enter a valid 6-digit code');
            return false;
          }
          return code;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const verificationCode = result.value;
          
          // Show enabling progress
          Swal.fire({
            title: 'Enabling 2FA...',
            text: 'Please wait while we verify your code',
            allowOutsideClick: false,
            showConfirmButton: false,
            customClass: {
              popup: 'mfa-swal-popup',
              title: 'mfa-swal-title',
              content: 'mfa-swal-content'
            },
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // Step 3: Enable 2FA with verification code
          Accounts.enableUser2fa(verificationCode, (error) => {
            if (error) {
              console.error('Error enabling 2FA:', error);
              Swal.fire({
                title: 'Verification Failed',
                text: 'The code you entered is incorrect. Please try again.',
                icon: 'error',
                customClass: {
                  popup: 'mfa-swal-popup',
                  title: 'mfa-swal-title',
                  content: 'mfa-swal-content'
                }
              });
            } else {
              twoFactorStatus.set(true);
              Swal.fire({
                title: 'Success! 🎉',
                text: 'Two-factor authentication has been enabled for your account.',
                icon: 'success',
                customClass: {
                  popup: 'mfa-swal-popup',
                  title: 'mfa-swal-title',
                  content: 'mfa-swal-content'
                }
              });
            }
          });
        }
      });
    });
  },

  'click .disable-2fa-btn'(event) {
    event.preventDefault();
    
    Swal.fire({
      title: 'Disable Two-Factor Authentication?',
      text: 'This will make your account less secure. Are you sure you want to continue?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Disable 2FA',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'mfa-swal-popup',
        title: 'mfa-swal-title',
        content: 'mfa-swal-content',
        confirmButton: 'auth-button danger',
        cancelButton: 'auth-button secondary'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Show disabling progress
        Swal.fire({
          title: 'Disabling 2FA...',
          text: 'Please wait',
          allowOutsideClick: false,
          showConfirmButton: false,
          customClass: {
            popup: 'mfa-swal-popup',
            title: 'mfa-swal-title',
            content: 'mfa-swal-content'
          },
          didOpen: () => {
            Swal.showLoading();
          }
        });

        Accounts.disableUser2fa((error) => {
          if (error) {
            console.error('Error disabling 2FA:', error);
            Swal.fire({
              title: 'Error',
              text: 'Failed to disable two-factor authentication. Please try again.',
              icon: 'error',
              customClass: {
                popup: 'mfa-swal-popup',
                title: 'mfa-swal-title',
                content: 'mfa-swal-content'
              }
            });
          } else {
            twoFactorStatus.set(false);
            Swal.fire({
              title: 'Disabled',
              text: 'Two-factor authentication has been disabled.',
              icon: 'info',
              customClass: {
                popup: 'mfa-swal-popup',
                title: 'mfa-swal-title',
                content: 'mfa-swal-content'
              }
            });
          }
        });
      }
    });
  },

  'click .logout-btn'(event) {
    event.preventDefault();
    
    Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'mfa-swal-popup',
        title: 'mfa-swal-title',
        content: 'mfa-swal-content',
        confirmButton: 'auth-button primary',
        cancelButton: 'auth-button secondary'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Meteor.logout((error) => {
          if (error) {
            console.error('Logout error:', error);
            Swal.fire({
              title: 'Error',
              text: 'Failed to logout. Please try again.',
              icon: 'error',
              customClass: {
                popup: 'mfa-swal-popup',
                title: 'mfa-swal-title',
                content: 'mfa-swal-content'
              }
            });
          } else {
            FlowRouter.go('/login');
          }
        });
      }
    });
  }
});