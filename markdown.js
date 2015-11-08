module.exports = function(dom) {

  var xmldom = new require('xmldom');
  var sanitizehtml = require('sanitize-html'); 
  var XMLSerializer = new xmldom.XMLSerializer();

  return read(dom);

  function read(dom) {
    var markdown = '';

    for(var i = 0; i < dom.childNodes.length; i++) {
      var childNode = dom.childNodes[i];

      var tag = childNode.tagName;
      
      switch(tag) {
        case 'p':
          markdown += paragraph(childNode);
          break;
        case 'h2':
          markdown += htag(childNode, 2);
          break;
        case 'ul':
          markdown += ul(childNode);
          break;
        case 'hr':
          markdown += hr();
          break;
        case 'a':
          markdown += a(childNode);
          break;
        case 'span':
          markdown += span(childNode);
          break;
        case 'img':
          markdown += img(childNode);
          break;
        case 'div':
          markdown += div(childNode);
          break;
        case 'em':
          markdown += em(childNode);
          break;
        case 'figure':
          markdown += read(childNode);
          break;
        case 'strong':
          markdown += strong(childNode);
          break;
        case 'iframe':
          markdown += iframe(childNode);
          break;
        case undefined:
          markdown += childNode.data.replace(/^\n*/, '').replace(/\n*$/, '').replace(/^ \s*/, ' ').replace(/ \s*$/, ' ');
          break;
      }
    }

    return markdown;
  }

  function paragraph(p) {
    return read(p) + '\n\n';
  }

  function htag(h, num) {
    var ret = '';
    for(var i = 0; i < num; i++) {
      ret += '#';
    }

    ret += ' ' + textVal(h) + '\n\n';

    return ret;
  }

  function ul(ul) {
    var ret = '';
    for(var i = 0; i < ul.childNodes.length; i++) {
      var childNode = ul.childNodes[i];
      if(childNode.tagName === 'li') {
        ret += '* ' + read(childNode) + '\n';
      }
    }

    return ret + '\n';
  }

  function hr() {
    return '* * *\n\n';
  }

  function a(dom) {
    var href = dom.getAttribute('href');
    var content = read(dom);

    return '[' + content + '](' + href + ')';
  }

  function strong(dom) {
    var content = read(dom);
    if(content) {
      return '**' + content + '**';
    }

    return '';
  }

  function em(dom) {
    var content = read(dom);
    if(content) {
      return '*' + content.replace(/^\s*/, '').replace(/\s*$/, '') + '*';
    }

    return '';
  }

  function span(dom) {
    if(dom.getAttribute('class').indexOf('off-screen') === -1) {
      return read(dom);
    }

    return '';
  }

  function img(dom) {
    var alt = dom.getAttribute('alt') || dom.getAttribute('data-alt');
    var src = dom.getAttribute('src') || dom.getAttribute('data-src');
    
    return '![' + alt + '](' + src + ')\n\n';
  }

  function iframe(dom) {
    var v = htmlVal(dom);
    console.log(v);

    return v;
  }

  function div(dom) {
    if(dom.getAttribute('data-alt') && dom.getAttribute('data-src')) {
      return img(dom);
    } else if(dom.getAttribute('class').indexOf('rtcode') !== -1) {
      return read(dom);
    }

    return '';
  }

  function htmlVal(dom) {
    return XMLSerializer.serializeToString(dom);
  }

  function textVal(dom) {
    return sanitizehtml(XMLSerializer.serializeToString(dom), {
      allowedTags: [],
      allowedAttributes: {}
    }).replace(/^\s*/, '').replace(/\s*$/, '');

  }
}