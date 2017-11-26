import * as Redux from 'redux'

import {FeedStream} from '../lib/FeedStream'
import {Model} from './model'

export namespace Action {
  export const Types = {
    Config: {
      FETCH_KEY_AND_ID: 'Config/FETCH_KEY_AND_ID',
      FETCH_KEY_AND_ID_COMPLETED: 'Config/FETCH_KEY_AND_ID_COMPLETED',
      FETCH_TOKEN: 'Config/FETCH_TOKEN',
      FETCH_TOKEN_COMPLETED: 'Config/FETCH_TOKEN_COMPLETED'
    },
    MessageStream: {
      ADD_ACTIVITY: 'MessageStream/ADD_ACTIVITY',
      ADD_ACTIVITY_COMPLETED: 'MessageStream/ADD_ACTIVITY_COMPLETED',
      ERROR: 'MessageStream/ERROR',
      ERROR_NO_FEED: 'MessageStream/ERROR_NO_FEED',
      RECEIVE: 'MessageStream/RECEIVE',
      START_PRODUCING: 'MessageStream/START_PRODUCING',
      STOP_PRODUCING: 'MessageStream/STOP_PRODUCING',
      START_STREAMING: 'MessageStream/START_STREAMING',
      START_STREAMING_COMPLETED: 'MessageStream/START_STREAMING_COMPLETED',
      STOP_STREAMING: 'MessageStream/STOP_STREAMING'
    }
  }

  export interface MessageStreamAction extends Redux.Action {
    activity?: Partial<Model.StreamMessage>
    config?: FeedStream.ClientConfig
    error?: string
    feedConfig?: FeedStream.FeedConfig
    json?: object
  }

  export const DO_NOTHING: MessageStreamAction = {type: 'DO_NOTHING'}

  export function addActivity(
    activity: Partial<Model.StreamMessage>,
    feedConfig: FeedStream.FeedConfig
  ): MessageStreamAction {
    return {
      type: Types.MessageStream.ADD_ACTIVITY,
      activity,
      feedConfig
    }
  }

  export function addActivityCompleted(
    feedConfig: FeedStream.FeedConfig
  ): MessageStreamAction {
    return {
      type: Types.MessageStream.ADD_ACTIVITY_COMPLETED,
      feedConfig
    }
  }

  export function error(
    err: string,
    feedConfig: FeedStream.FeedConfig
  ): MessageStreamAction {
    return {
      type: Types.MessageStream.ERROR,
      error: err,
      feedConfig
    }
  }

  export function errorNoFeed(err: string): MessageStreamAction {
    return {
      type: Types.MessageStream.ERROR_NO_FEED,
      error: err
    }
  }

  export function fetchConfig(): MessageStreamAction {
    return {type: Types.Config.FETCH_KEY_AND_ID}
  }

  export function fetchConfigCompleted(json: object): MessageStreamAction {
    return {
      type: Types.Config.FETCH_KEY_AND_ID_COMPLETED,
      json
    }
  }

  export function fetchToken(
    feedConfig: FeedStream.FeedConfig
  ): MessageStreamAction {
    return {
      type: Types.Config.FETCH_TOKEN,
      feedConfig
    }
  }

  export function fetchTokenCompleted(
    feedConfig: FeedStream.FeedConfig,
    json: object
  ): MessageStreamAction {
    return {
      type: Types.Config.FETCH_TOKEN_COMPLETED,
      feedConfig,
      json
    }
  }

  export function receive(
    json: object,
    feedConfig: FeedStream.FeedConfig
  ): MessageStreamAction {
    return {
      type: Types.MessageStream.RECEIVE,
      feedConfig,
      json
    }
  }

  export function startProducing(
    config: FeedStream.ClientConfig,
    feedConfig: FeedStream.FeedConfig
  ): MessageStreamAction {
    return {
      type: Types.MessageStream.START_PRODUCING,
      config,
      feedConfig
    }
  }

  export function startStreaming(
    config: FeedStream.ClientConfig,
    feedConfig: FeedStream.FeedConfig
  ): MessageStreamAction {
    return {
      type: Types.MessageStream.START_STREAMING,
      config,
      feedConfig
    }
  }

  export function startStreamingCompleted(
    feedConfig: FeedStream.FeedConfig
  ): MessageStreamAction {
    return {
      type: Types.MessageStream.START_STREAMING_COMPLETED,
      feedConfig
    }
  }

  export function stopProducing(
    feedConfig: FeedStream.FeedConfig
  ): MessageStreamAction {
    return {
      type: Types.MessageStream.STOP_PRODUCING,
      feedConfig
    }
  }

  export function stopStreaming(
    feedConfig: FeedStream.FeedConfig
  ): MessageStreamAction {
    return {
      type: Types.MessageStream.STOP_STREAMING,
      feedConfig
    }
  }
}
