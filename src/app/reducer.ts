import {Action} from './action'
import {FeedStream} from '../lib/FeedStream'
import {Model} from './model'

export namespace Reducer {
  export function streamState(
    state: Model.MessageStreamState = new Model.MessageStreamState(),
    action: Action.MessageStreamAction = Action.DO_NOTHING
  ): Model.MessageStreamState {
    if (action.feedConfig) {
      const key = FeedStream.getKey(action.feedConfig)
      return new Model.MessageStreamState({
        ...state,
        streams: {
          ...state.streams,
          [key]: messageStream({
            ...Object(state.streams[key]),
            config: action.feedConfig,
            key
          }, action)
        }
      })
    }
    else {
      const {ERROR_NO_FEED} = Action.Types.MessageStream
      const {FETCH_KEY_AND_ID, FETCH_KEY_AND_ID_COMPLETED} = Action.Types.Config

      switch (action.type) {
        case ERROR_NO_FEED: return new Model.MessageStreamState({
          ...state,
          error: action.error || ''
        })
        case FETCH_KEY_AND_ID: return new Model.MessageStreamState({
          ...state,
          isFetchingConfig: true
        })
        case FETCH_KEY_AND_ID_COMPLETED: return new Model.MessageStreamState({
          ...state,
          isFetchingConfig: false,
          json: action.json
        })
        default: return state
      }
    }
  }

  function messageStream(
    stream: Model.MessageStream = new Model.MessageStream(),
    action: Action.MessageStreamAction = Action.DO_NOTHING
  ): Model.MessageStream {
    const {Config, MessageStream} = Action.Types
    const {
      ADD_ACTIVITY,
      ADD_ACTIVITY_COMPLETED,
      ERROR,
      RECEIVE,
      START_PRODUCING,
      START_STREAMING_COMPLETED,
      STOP_PRODUCING,
      STOP_STREAMING
    } = MessageStream
    const {FETCH_TOKEN, FETCH_TOKEN_COMPLETED} = Config

    switch (action.type) {
      case ADD_ACTIVITY: return new Model.MessageStream({
        ...stream,
        error: '',
        isAdding: true
      })
      case ADD_ACTIVITY_COMPLETED: return new Model.MessageStream({
        ...stream,
        error: '',
        isAdding: false,
        json: action.json
      })
      case ERROR: return new Model.MessageStream({
        ...stream,
        error: action.error || ''
      })
      case FETCH_TOKEN: return new Model.MessageStream({
        ...stream,
        isFetchingToken: true
      })
      case FETCH_TOKEN_COMPLETED: return new Model.MessageStream({
        ...stream,
        isFetchingToken: false,
        json: action.json
      })
      case RECEIVE: return new Model.MessageStream({
        ...stream,
        error: '',
        json: action.json
      })
      case START_PRODUCING: return new Model.MessageStream({
        ...stream,
        error: '',
        isProducing: true
      })
      case START_STREAMING_COMPLETED: return new Model.MessageStream({
        ...stream,
        error: '',
        isStreaming: true
      })
      case STOP_PRODUCING: return new Model.MessageStream({
        ...stream,
        error: '',
        isProducing: false
      })
      case STOP_STREAMING: return new Model.MessageStream({
        ...stream,
        error: '',
        isStreaming: false
      })
      default: return stream
    }
  }
}
