
const CleanCSS = require('clean-css')
const sass = require('node-sass')
const moment = require('moment')
const logger = require('logacious')()
const path = require('path')
const fs = require('fs')

let cssCleaner = new CleanCSS()
let cssCache = {}
let isProduction = process.env.NODE_ENV === 'production'

module.exports = function(dust, conf) {

  if(!conf) {
    logger.warn('portchain-dustjs-helpers: missing configuration')
  }
  
  function loadCSS(src) {
    let srcPath = path.resolve(path.join(conf.stylesDirectory, src))
    let cssContent = fs.readFileSync(srcPath, 'utf-8')
    if(/\.s[ac]ss$/.test(src)) {
      cssContent = sass.renderSync({
        data: cssContent,
        includePaths: [conf.stylesDirectory]
      }).css.toString()
    }
    cssContent = cssCleaner.minify(cssContent).styles
    return `<style>${cssContent}</style>`
  }
  
  dust.helpers.formatDate = (chunk, context, bodies, params) => {
    let value = context.resolve(params.date, chunk, context)
    let format = context.resolve(params.format, chunk, context)
    let output = moment(new Date(value)).format(format)
    return chunk.write(output)
  }
  
  dust.helpers.formatBoolean = (chunk, context, bodies, params) => {
    let value = context.resolve(params.value, chunk, context)
    let output = value ? 'Yes' : 'No'
    return chunk.write(output)
  }
  
  if(conf && conf.stylesDirectory) {
    
    dust.helpers.css = (chunk, context, bodies, params) => {
      let src = context.resolve(params.src, chunk, context)
      let output = loadCSS(src)
      return chunk.write(output)
    }
  } else {
    logger.warn('portchain-dustjs-helpers: configuration is missing stylesDirectory field. Ignoring')
  }

  dust.helpers.iterate = (chunk, context, bodies) => {
    try {
      var obj = context.current()
      for (var k in obj) {
        chunk = chunk.render(bodies.block, context.push({key: k, value: obj[k]}))
      }
      return chunk
    } catch(err) {
      logger.error(err)
      return err.message
    }
  }

  dust.helpers.json = (chunk, context, bodies, params) => {
    let value = context.resolve(params.value, chunk, context)
    let json = JSON.stringify(value, null, 2)
    return json
  }
}
