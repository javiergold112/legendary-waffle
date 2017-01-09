const html = require('choo/html')
const cuid = require('cuid')
const modal = require('../elements/web/modal')
// const sf = require('sheetify')
// sf('css/game.css', {global: true})

module.exports = function (globalConfig) {
  return function (state, prev, send) {
    if (state.page === 'INDEX') return getIndexHtml(state, prev, send)
    if (state.page === 'DASHBOARD') return getDashboardHtml(state, prev, send)
  }
}

function getIndexHtml(state, prev, send) {
  return modal(html`
    <div>
      <div class="row">
          <h1>Welcome!</h1>
      </div>
      <p>To continue please enter a rather unique name for your group or create one</p>
      <div class="row">
          <input type="text" id="gid" name="gid" class="enter_id" autofocus="autofocus">
          <button class="random_id" onclick=${generateRandomGroup}>Generate Name</button>
      </div>
      <button class="good" value="Start" onclick=${startPeerstarMain(send)}>Start</button>
    </div>
`)
}

function getDashboardHtml(state, prev, send) {
  if (!state.p2p.star || state.p2p.star.closed) {
    send('setPage', 'INDEX')
    return html`<div></div>`
  }

  return html`
<div>
    <div class="row">
        <h1>Board of Dashiness! ${state.p2p.star.GID}</h1>
    </div>
    <div class="row">
    <ul>
        ${state.presenter.clients.ids.map((c) => {
            return html`
            <li>${state.presenter.clients.names[c] + ' [' + c + ']'}</li>
          `
        })}
    </ul>
    </div>
</div>
`
}

function startPeerstarMain(send) {
  return inner
  function inner (event) {
    event.preventDefault()
    var group = document.getElementById('gid').value
    if (group) {
      send('p2p:createStar', group)
      send('setPage', 'DASHBOARD')
    }
  }
}

function generateRandomGroup (event) {
  event.preventDefault()
  var group = cuid()
  // extract client fingerprint
  group = group.slice(13, 17)
  document.getElementById('gid').value = group
}
