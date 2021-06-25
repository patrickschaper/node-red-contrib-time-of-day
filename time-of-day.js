module.exports = function (RED) {
  const getDateFromTimeString = str => new Date(null, null, null, ...str.split(':').map(t => parseInt(t)))

  function TimeOfDayNode (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.startTime = config.startTime
    this.endTime = config.endTime
    this.outputs = config.outputs

    this.errorMsg = msg => {
      this.error(msg)
      this.status({ fill: 'red', shape: 'dot', text: msg })
      setTimeout(() => this.status({}), 10000)
    }

    this.validateDates = function (startDate, endDate) {
      if (startDate >= endDate) {
        this.errorMsg('Start time >= end time')
        return false
      }
      return true
    }

    if (!/^\d\d:\d\d:\d\d$/.test(this.startTime) || !/^\d\d:\d\d:\d\d$/.test(this.endTime)) {
      this.errorMsg('Malformed time')
      return false
    }

    this.startDate = getDateFromTimeString(this.startTime)
    this.endDate = getDateFromTimeString(this.endTime)

    this.validateDates(this.startDate, this.endDate)

    const node = this

    node.on('input', function (msg) {
      if (!node.validateDates(node.startDate, node.endDate)) return

      const now = Date.now()
      const start = (new Date(now)).setHours(node.startDate.getHours(), node.startDate.getMinutes(), node.startDate.getSeconds(), 0)
      const end = (new Date(now)).setHours(node.endDate.getHours(), node.endDate.getMinutes(), node.endDate.getSeconds(), 0)

      if (now >= start && now < end) {
        node.send([msg, null])
        return
      }

      node.send([null, msg])
    })
  }

  RED.nodes.registerType("time-of-day", TimeOfDayNode)
}
