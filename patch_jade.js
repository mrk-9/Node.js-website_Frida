/*
 * FRAGILE!
 * The following HACK monkey-patches Keystone's Jade in order to redirect
 * certain template includes and therefore override the admin base template.
 */

var path = require('path')
  , keystonePath = require('resolve').sync('keystone')
  , keystoneDir = path.dirname(keystonePath)
  , jade = require('require-like')(keystonePath)('jade');

var _resolvePath = jade.Parser.prototype.resolvePath;

jade.Parser.prototype.resolvePath = function resolvePath () {
  var abspath     = path.resolve(this.filename)
    , isBuiltIn   = abspath.indexOf(keystoneDir) === 0
    , extendsBase = arguments[0] === '../layout/base'
  if (isBuiltIn && extendsBase) {
    arguments[0] = '../../../../templates/layouts/admin';
  }
  return _resolvePath.apply(this, arguments);
}

