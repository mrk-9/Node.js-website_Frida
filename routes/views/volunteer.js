var keystone = require('keystone');

exports = module.exports = {
  
  index: function(req,res){
    var view = new keystone.View(req, res);
    var locals = res.locals;
    
    locals.active = 'volunteer';
    
    view.on('init',function(next){
      keystone.list('GetInvolved').model.findOne({'_id':'5733a785428242d376401f1b'}).exec(function(err,result){
        locals.data = result;
        next(err);
      });
    });
    // Render the view
    view.render('get-involved');
  },

  register: function(req,res){
    
    var view = new keystone.View(req, res);
    var locals = res.locals;
    
    locals.active = 'volunteer';
    
    view.render('coming-soon');
    
  },
  
  donate: function(req, res) {

    res.locals.active = 'donate';

    var view = new keystone.View(req, res).on('init', getStripeData);
    if (req.method === 'POST') view.on('init', submitCharge);
    view.render('donate');

    function getStripeData (next) {
      var _done = 0;
      function done () { _done++; if (_done===2) next() }

      keystone.list('DonationType').model.find().exec(
        function (err, results) {
          if (err) next(err);
          res.locals.donationTypes = results;
          done(); })

      keystone.list('StripeSettings').model.findOne().exec(
        function (err, result) {
          if (err) next(err);
          res.locals.stripeSettings = { publishableKey: result.publishableKey };
          done(); }) }

    function submitCharge (next) {
      keystone.list('StripeSettings').model.findOne().exec(
        function (err, result) {
          if (err) return next(err);

          var description = '';
          res.locals.donationTypes.some(function (type) {
            if (type._id == req.body.donationType) {
              description = type.name;
              return true; } });

          var charge = require('stripe')(result.secretKey).charges.create(
            { amount: req.body.actualAmount
            , currency: 'usd'
            , source: req.body.token
            , description: description },
            { idempotency_key: uuid() },
            function (err, charge) {
              if (err && err.type === 'card_error') {
                res.locals.stripeError = err.message;
              } else if (err) {
                res.locals.stripeError = 'Technical error. Please retry.';
              }
              next();
            }) }); }

  }

};


function uuid(a){
  return a?(a^Math.random()*16>>a/4).toString(16)
    :([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)}
