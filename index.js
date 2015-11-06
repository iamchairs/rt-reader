module.exports = (function() {
   'use strict';

   var request = require('request');
   var xmldom = new require('xmldom');
   var q = require('q');
   var sanitizehtml = require('sanitize-html'); 
   var toMarkdown = require('./markdown');

   return RTReader;

   function RTReader() {
      var self = this;

      this.read = read;

      this.DOMParser = new xmldom.DOMParser({
         errorHandler: {
            warning: function() {/* Ignore */},
            error: function() {/* Ignore */}
         }
      });
      this.XMLSerializer = new xmldom.XMLSerializer();

      /* For Clean Text */
      this.cleanTags = [];
      this.cleanAttributes = {};

      /* For Minimal Non-Clean Text */
      this.minimalTags = ['p', 'cite', 'b', 'i', 'em', 'strong', 'a'];
      this.minimalAttributes = false;

      function read(url, cb) {
         var defer = q.defer();

         request(url, function(error, response, body) {
            if(error) {
               return err(error);
            }

            var Article = {
               title: '',
               datetime: '',
               body: {
                  clean: '',
                  minimal: ''
               },
               images: [
               ],
               source: url
            };

            var dom;
            try {
               dom = self.DOMParser.parseFromString(body, 'text/html');
            } catch(e) {}

            if(!dom) {
               return err('wasnt able to read dom');
            }

            var divs = dom.getElementsByTagName('div');
            var body;

            for(var i = 0; i < divs.length; i++) {
               var div = divs[i];
               if(div.getAttribute('class').indexOf('article__text') !== -1) {
                  body = div;
                  break;
               }
            }

            if(!body || !body.getElementsByTagName) {
               return err('wasnt able to find dom body');
            }

            var ps = body.getElementsByTagName('p');

            var bodyCleanStrings = [];
            var bodyMinimalStrings = [];
            for(var i = 0; i < ps.length; i++) {
               var p = ps[i];
               var raw = self.XMLSerializer.serializeToString(p);

               bodyCleanStrings.push(sanitizehtml(raw, {
                  allowedTags: self.cleanTags,
                  allowedAttributes: self.cleanAttributes
               }));
            }

            var markdown = toMarkdown(body);

            Article.body.clean = bodyCleanStrings.join('\n\n');
            Article.body.markdown = markdown;

            var h1 = dom.getElementsByTagName('h1');
            var h1Raw = self.XMLSerializer.serializeToString(h1[0]);
            Article.title = sanitizehtml(h1Raw, {
               allowedTags: self.cleanTags,
               allowedAttributes: self.cleanAttributes
            }).replace(/^\s*/, '').replace(/\s*$/, '');

            var imgs = dom.getElementsByTagName('img');
            for(var i = 0; i < imgs.length; i++) {
               var img = imgs[i];
               if(img.getAttribute('class').indexOf('media__item') !== -1) {
                  var srcFull = img.getAttribute('src');
                  var caption = img.getAttribute('alt');
                  if(caption === '©') {
                     caption = Article.title;
                  }

                  if(srcFull) {
                     var found = false;
                     for(var k = 0; k < Article.images.length; k++) {
                        if(Article.images[k].full === srcFull) {
                           found = true;
                        }
                     }

                     if(!found) {
                        Article.images.push({
                           full: srcFull,
                           caption: caption
                        });
                     }
                  }
               }
            }

            var times = dom.getElementsByTagName('time');
            var time = self.XMLSerializer.serializeToString(times[0]);
            var datetime = sanitizehtml(time, {
               allowedTags: self.cleanTags,
               allowedAttributes: self.cleanAttributes
            }).replace(/^\s*/, '').replace(/\s*$/, '');

            if(!datetime) {
               return err('unable to find datetime');
            }

            Article.datetime = new Date(datetime);

            if(cb) {
               cb(Article);
            }

            defer.resolve(Article);
         });

         return defer.promise;

         function err(str) {
            console.error('Error from url: ' + url);
            console.error(str);
            defer.resolve(null);

            if(cb) {
               cb(null);
            }

            return false;
         }
      }
   }
})();