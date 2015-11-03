process.env.TZ = 'GMT';

var RTReader = require('./index');
var toMarkdown = require('./markdown');
var reader = new RTReader();

var sampleDom = '<p>test text node <a href="http://google.com"><p>this whole 2 par is link</p><p>im serious</p></a></p>';

var xmldom = new require('xmldom');
DOMParser = new xmldom.DOMParser({
   errorHandler: {
      warning: function() {/* Ignore */},
      error: function() {/* Ignore */}
   }
});
var dom = DOMParser.parseFromString(sampleDom);

reader.read('https://www.rt.com/usa/320542-sigar-afghanistan-pentagon-waste/').then(function(article) {
  
});