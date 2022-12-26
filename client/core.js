import { Meteor } from 'meteor/meteor';
import { moment } from 'meteor/momentjs:moment';
import { Template } from 'meteor/templating';
import { filesize } from 'meteor/mrt:filesize';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { ReactiveVar } from 'meteor/reactive-var';

//import Analytics from 'meteor/ostrio:analytics';

import { persistentReactive } from '/imports/client/misc/persistent-reactive.js';
import { setUpServiceWorker } from '/imports/client/misc/setup-service-worker.js';
import { _app, Collections } from '/imports/lib/core.js';

import '/imports/client/styles/bundle.sass';

import '/imports/client/files.collection.js';
import '/imports/client/router/router.js';
import '/imports/client/router/routes.js';

// Used by pre-rendering service:
window.IS_RENDERED = false;
Meteor.setTimeout(() => {
  window.IS_RENDERED = true;
}, 10240);

// ENABLE ANALYTICS IF TRACKING_ID IS PROVIDED
//if (Meteor.settings.public?.trackingId) {
//  _app.analytics = new Analytics(Meteor.settings.public.trackingId);
//}

// HELPER FOR CREATING MULTIPLE LISTENERS
const addListener = (target, events, func) => {
  events.forEach((event) => {
    target.addEventListener(event, func, { passive: true, capture: false });
  });
};

// VARAIABLES AND LISTENERS USED TO TRIGGER UI
// UPON DRAG'n DROP ACTION
_app.isFileOver = new ReactiveVar(false);
let dndTarget = null;
addListener(window, ['dragenter', 'dragover'], (e) => {
  e.stopPropagation();
  dndTarget = e.target;
  _app.isFileOver.set(true);
  return false;
});

addListener(window, ['dragleave'], (e) => {
  e.stopPropagation();
  if (dndTarget === e.target) {
    _app.isFileOver.set(false);
  }
  return false;
});

addListener(window, ['drop'], (e) => {
  e.stopPropagation();
  _app.isFileOver.set(false);
  return false;
});

_app.isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent || navigator.vendor || window.opera) && !window.MSStream;
_app.isMobile = _app.isiOS || ('ontouchstart' in window);
_app.isStandalone = ('standalone' in window.navigator && window.navigator.standalone) || window.matchMedia('(display-mode: standalone)').matches || false;
_app.isSmall = ((document.documentElement.clientWidth || document.body.clientWidth) < 768);
_app.uploads = new ReactiveVar(false);
_app.currentUrl = () => {
  return Meteor.absoluteUrl((FlowRouter.current().path || document.location.pathname).replace(/^\//g, '')).split('?')[0].split('#')[0].replace('!', '');
};

// STORE USER'S CHOICE OF TRANSPORT
_app.conf.uploadTransport = persistentReactive('uploadTransport', 'http');
// STORE FILES BLAMED BY THIS USER
_app.conf.blamed = persistentReactive('blamedUploads', []);
// ReactiveVar USED TO SHOW "A new version available..." PROMPT
_app.isNewVersionAvailable = new ReactiveVar(false);

Template.registerHelper('isFileOver', () => {
  return _app.isFileOver.get();
});

Template.registerHelper('url', (string = null) => {
  return Meteor.absoluteUrl(string);
});

Template.registerHelper('filesize', (size = 0) => {
  return filesize(size);
});

Template.registerHelper('getMaxSize', () => {
  return filesize(_app.conf.maxFileSize).replace('.00', '');
});

Template.registerHelper('maxFilesQty', () => {
  return _app.conf.maxFilesQty;
});

Template.registerHelper('getTTL', () => {
  return _app.conf.fileTTLSec / 3600;
});

Template.registerHelper('isMobile', () => {
  return _app.isMobile;
});

Template.registerHelper('isSmall', () => {
  return _app.isSmall;
});

Template.registerHelper('fromNow', (timestamp) => {
  return moment(timestamp).fromNow();
});

Meteor.startup(() => {
  // MINOR SEO OPTIMIZATION
  document.documentElement.setAttribute('itemscope', '');
  document.documentElement.setAttribute('itemtype', 'http://schema.org/WebPage');
  document.documentElement.setAttribute('lang', 'en');
});

Meteor.hasPWASupport = false;
Meteor.pwaInstallPrompt = new ReactiveVar(false);
setUpServiceWorker();

export { _app, Collections };
