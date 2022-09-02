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
      if (startDate == endDate) {
        this.errorMsg('Start time == end time')
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
      var start = (new Date(now)).setHours(node.startDate.getHours(), node.startDate.getMinutes(), node.startDate.getSeconds(), 0)
      var end = (new Date(now)).setHours(node.endDate.getHours(), node.endDate.getMinutes(), node.endDate.getSeconds(), 0)
      const isFlipped = start > end
      if (isFlipped) {
        [start, end] = [end start]
      }
      var isInRange

      if (now >= start && now < end) {
        isInRange = true
      } else {
        isInRange = false
      }
      
      if (isInRange == !isFlipped) {
        this.status({ fill: 'green', shape: 'dot', text: 'Time within range' });
        node.send([msg, null])
      } else {
        this.status({ fill: 'green', shape: 'ring', text: 'Time outside range' });
        node.send([null, msg])
      }
    })
  }

  RED.nodes.registerType("time-of-day", TimeOfDayNode)
}
