'use strict';
const fs = require('fs');
const minify = require('minify');
const path = require('path');
const pkg = require('./package.json');

const options = {
    html: {
        removeAttributeQuotes: false,
        removeOptionalTags: false,
    },
};

/** https://stackoverflow.com/questions/13786160/copy-folder-recursively-in-node-js
 * Look ma, it's cp -R.
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 */
var copyRecursiveSync = function(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

if (fs.existsSync('./dist')) {
    fs.rmdirSync('./dist',{recursive:true})
}
fs.mkdirSync('./dist');

fs.readdirSync('./src').forEach((f)=>{
    if (f.match(/\.glsl$/)) {
        // Strip whitespace/comments out of the shaders.
        let data = fs.readFileSync('./src/'+f,'utf-8');
        let min = data.replace(/^\s+/g,'')
            .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
            .replace(/^\s*$/gm,'')
            .replace(/(?<=\W)[ \t]+(?=\W)/g,'')
            .replace(/(?<!\W)[ \t]+(?=\W)/g,'')
            .replace(/(?<=\W)[ \t]+(?!\W)/g,'')
            .replace(/\r\n/g,"\n");
        fs.writeFileSync('./dist/'+f,min);
    } else if (f.match(/\.(html|css|js)$/i)) {
        // Minify html, css, and javascript
        minify('./src/'+f, options).then(m=>{
            if (f.match(/index\.html/)) {
                m = m.replace(/%%VERSION%%/,pkg.version);
            }
            fs.writeFileSync('./dist/'+f,m);
        });
    } else if (f.match(/\.json$/i)) {
        // strip whitespace out of the JSON.
        let data = fs.readFileSync('./src/'+f,'utf-8');
        let json = JSON.parse(data);
        fs.writeFileSync('./dist/'+f,JSON.stringify(json));
    }
})

copyRecursiveSync('./assets','./dist/assets');
// Fonts get inlined into the css by minify so we don't need them.
fs.rmdirSync('./dist/assets/font',{recursive:true})
