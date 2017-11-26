import {FeedStream} from '../lib/FeedStream'
import * as Get from '../lib/getOrElse'

export namespace Model {
  export interface StreamMessage {
    actor: string
    id: string
    object: string
    time: Date
    verb: string
  }

  export class StreamMessage implements StreamMessage {
    actor = ''
    id = ''
    object = ''
    time = new Date(0)
    verb = ''

    constructor(arg: Partial<StreamMessage & {json: object}> = {}) {
      const {json, ...message} = arg

      const keys = Object.keys(message) as (keyof StreamMessage)[]
      keys.forEach(key => {
        const value = arg[key]
        if (value !== undefined) { this[key] = value }
      })

      if (json) {
        this.actor = Get.stringOr(json, 'actor', '')
        this.id = Get.stringOr(json, 'id', '')
        this.object = Get.stringOr(json, 'object', '')
        try { this.time = new Date(Get.stringOr(json, 'time', '')) }
        catch (_) { } // Retain default of new Date(0).
        this.verb = Get.stringOr(json, 'verb', '')
      }
    }
  }

  export interface MessageStream {
    config: FeedStream.FeedConfig
    error: string
    isAdding: boolean
    isFetchingToken: boolean
    isProducing: boolean
    isStreaming: boolean
    key: string
    messages: StreamMessage[]
  }

  export class MessageStream implements MessageStream {
    config: FeedStream.FeedConfig = {slug: '', token: '', userId: ''}
    error = ''
    isAdding = false
    isFetchingToken = false
    isProducing = false
    isStreaming = false
    key = ''
    messages: StreamMessage[] = []

    constructor(arg: Partial<MessageStream & {json: object}> = {}) {
      const {json, ...state} = arg

      const keys = Object.keys(state) as (keyof MessageStream)[]
      keys.forEach(key => {
        const value = arg[key]
        if (value !== undefined) this[key] = value
      })

      if (json) {
        if ('token' in json) {
          this.config.token = Get.stringOr(json, 'token')
        }
        if ('new' in json) {
          const newMsgs = Get.arrayOr(json, 'new')
            .map(msg => new Model.StreamMessage({json: Object(msg)}))
          this.messages = this.messages.concat(newMsgs)
        }
      }
    }
  }

  export interface MessageStreamState {
    config: FeedStream.ClientConfig
    error: string
    isFetchingConfig: boolean
    streams: {[index: string]: MessageStream}
  }

  export class MessageStreamState implements MessageStreamState {
    config = {apiKey: '', appId: ''}
    error = ''
    isFetchingConfig = false
    streams: {[index: string]: MessageStream} = {}

    constructor(arg: Partial<MessageStreamState & {json: object}> = {}) {
      const {json, ...state} = arg

      const keys = Object.keys(state) as (keyof MessageStreamState)[]
      keys.filter(key => key !== 'streams').forEach(key => {
        const value = state[key]
        if (value !== undefined) this[key] = value
      })

      const streams = state.streams || {}
      Object.keys(streams).forEach(key => {
        const value = streams[key]
        if (value !== undefined) this.streams[key] = value
      })

      if (json && 'keyAndId' in json) {
        this.config = {
          apiKey: Get.stringOr(json, 'keyAndId.apiKey'),
          appId: Get.stringOr(json, 'keyAndId.appId')
        }
      }
    }
  }
}
