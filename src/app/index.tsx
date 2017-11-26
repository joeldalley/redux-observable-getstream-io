import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as ReactRedux from 'react-redux'
import * as Redux from 'redux'
import * as ReduxObservable from 'redux-observable'

import {Component} from './component'
import {Epic} from './Epic'
import {Model} from './model'
import {Reducer} from './reducer'

const props = [
  {
    activity: {
      actor: 'Daniel Day-Lewis',
      verb: 'drinks',
      object: 'your milkshake'
    },
    feedConfig: {slug: 'MessageStream', userId: '1'},
    styles: {
      backgroundColor: '#eee',
      float: 'left',
      paddingRight: '10px',
      width: '50%'
    }
  },
  {
    activity: {
      actor: 'Joe Pesci',
      verb: 'is',
      object: 'a clown to you'
    },
    feedConfig: {slug: 'MessageStream', userId: '2'},
    styles: {
      backgroundColor: '#ddd',
      float: 'right',
      paddingLeft: '10px',
      width: '50%'
    }
  }
]

///////////////////////////////////////////////////////////////
// Wire up Redux store and mount the app to the DOM

type StreamState = {streamState: Model.MessageStreamState}

const reducer: Redux.Reducer<StreamState> = Redux.combineReducers({
  streamState: Reducer.streamState
})

function logger({getState}: any) {
  return (next: any) => (action: any) => {
    console.log('Dispatch', action)
    const nextAction = next(action)
    console.log('State.streams', getState().streamState)
    return nextAction
  }
}

export function launchApp() {
  const store = Redux.createStore(
    reducer,
    Redux.applyMiddleware(
      logger,
      ReduxObservable.createEpicMiddleware(
        ReduxObservable.combineEpics(
          Epic.addActivity,
          Epic.fetchKeyAndId,
          Epic.fetchToken,
          Epic.streamMessages
        )
      )
    )
  )

  ReactDOM.render(
    <ReactRedux.Provider store={store}>
      <div>
        <Component.MessageStream {...props[0]}/>
        <Component.MessageStream {...props[1]}/>
      </div>
    </ReactRedux.Provider>,
    document.getElementById('app')
  )
}

launchApp()
