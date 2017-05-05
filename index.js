

const moment = require('moment')


module.exports = function(dust) {
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

  dust.helpers.iterate = (chunk, context, bodies) => {
    try {
      var obj = context.current()
      for (var k in obj) {
        chunk = chunk.render(bodies.block, context.push({key: k, value: obj[k]}))
      }
      return chunk
    } catch(err) {
      console.error(err)
      return err.message
    }
  }

  dust.helpers.json = (chunk, context, bodies, params) => {
    let value = context.resolve(params.value, chunk, context)
    let json = JSON.stringify(value, null, 2)
    return json
  }
}
