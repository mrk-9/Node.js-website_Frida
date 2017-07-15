var keystone = require('keystone');

var donationType = new keystone.List('DonationType',
  { label:  'Donation Type'
  , plural: 'Donation Types' });

donationType.add(
  { name:        { type: String, label: 'Name' } 
  , description: { type: String, label: 'Description'} });

donationType.register();

var stripeSettings = new keystone.List('StripeSettings',
  { label:    'Stripe Settings'
  , plural:   'Stripe Settings'
  , nocreate: true });

stripeSettings.add(
  { secretKey:      { type: String, label: 'Secret Key' }
  , publishableKey: { type: String, label: 'Publishable Key' }})

stripeSettings.register();
