const _ = require('lodash')
const uid = require('uid')
const entities = require('../entities')
const { isFieldEmpty } = require('../../../lib/game')
const { hasEnoughResources } = require('../../../lib/game')

const markerSpawner = {
  requires: ['position', 'team'],

  effects: {
    spawn: (state, { type, requiredWorkers }, game, send) => {
      const { position, team } = state
      const marker = entities.marker({
        x: position.x,
        y: position.y,
        teamId: team.id,
        taskType: type,
        requiredWorkers
      })

      send('game:createEntity', { data: marker }, _.noop)
    }
  }
}

const towerSpawner = {
  requires: ['position', 'team'],

  effects: {
    spawn: ({ position, team }, data, game, send) => {
      const x = position.x
      const y = position.y

      if (isFieldEmpty(game, x, y)) {
        const tower = entities.tower({ x, y, teamId: team.id })

        // TODO: remove ! / insert real cost of tower
        if (!hasEnoughResources(game, team.id, 10)) {
          send('game:createEntity', { data: tower }, _.noop)
          send('game:increaseGamePoints', { teamId: team.id, amount: 100 }, _.noop)
        }

        // TODO: check that tower is not near base, this is checked in the buildTowerNearPosition
        //       but could be circumvented by calling spawn direclty with custom Javascript code
      }
    }
  }
}

const robotSpawner = {
  requires: ['position', 'team'],

  reducers: {
    setStepsSinceLastSpawn: (state, { steps }) => ({
      robotSpawner: { stepsSinceLastSpawn: { $set: steps } }
    })
  },

  effects: {
    update: ({ id, robotSpawner, position, team }, data, game, send) => {
      let stepsSinceLastSpawn = robotSpawner.stepsSinceLastSpawn

      // spawn entity on interval
      if ((stepsSinceLastSpawn % robotSpawner.interval) === 0) {
        const id = uid()
        const robot = entities.robot({ id, x: position.x, y: position.y, teamId: team.id })

        send('game:createEntity', { data: robot }, _.noop)
        send('runtime:createRobot', { id, groupId: team.id }, _.noop)
      }

      // increment stepsSinceLastSpawn
      send('game:robotSpawner.setStepsSinceLastSpawn', {
        target: id,
        data: { steps: stepsSinceLastSpawn + 1 }
      }, _.noop)
    }
  }
}

module.exports = {
  markerSpawner,
  towerSpawner,
  robotSpawner
}
