import * as GetStream from 'getstream'
import * as Rx from 'rxjs/Rx'

export namespace FeedStream {
  export interface ClientConfig {
    apiKey: string
    appId: string
  }

  export interface FeedConfig {
    slug: string
    token?: string
    userId: string
  }

  export function getKey(config: FeedConfig) {
    return [config.slug, config.userId].join('-')
  }

  const clients: {[index: string]: GetStream.Client} = {}
  const feeds: {[index: string]: GetStream.Feed | undefined} = {}
  const streams: {[index: string]: Rx.Subject<object>} = {}

  export class Factory {
    static getClient(clientConfig: ClientConfig) {
      const {apiKey, appId} = clientConfig
      const key = [apiKey, appId].join('-')

      let client: GetStream.Client | undefined = clients[key]
      let error = ''

      if (!client && apiKey && appId) {
        try {
          clients[key] = GetStream.connect(apiKey, null, appId)
          client = clients[key]
        }
        catch (err) {
          delete clients[key]
          client = undefined
          error = `${err}`
        }
      }
      return {client, error}
    }

    static getFeed(clientConfig: ClientConfig, feedConfig: FeedConfig) {
      let {client, error} = Factory.getClient(clientConfig)
      if (error || !client) {
        return {
          error: error || 'Unable to get a connected GetStream client',
          feed: undefined
        }
      }

      const key = getKey(feedConfig)
      const {slug, token, userId} = feedConfig
      if (!(key in feeds)) {
        try {
          if (!token) throw 'Token missing'
          feeds[key] = client.feed(slug, userId, token)
        }
        catch (err) {
          delete feeds[key]
          error = `${err}`
        }
      }

      return {error, feed: feeds[key]}
    }

    static getStream(clientConfig: ClientConfig, feedConfig: FeedConfig) {
      let {error, feed} = Factory.getFeed(clientConfig, feedConfig)
      if (error || !feed) {
        return {
          error: error || 'Unable to get a connected GetStream feed',
          stream: undefined
        }
      }

      const key = getKey(feedConfig)
      if (!(key in streams)) {
        streams[key] = new Rx.Subject()
        try {
          feed.subscribe((msg: any) => {
            if (key in streams) {
              streams[key].next(msg)
            }
          })
        }
        catch(err) {
          delete streams[key]
          return {
            error: `${err}`,
            stream: undefined
          }
        }
      }

      return {error, stream: streams[key]}
    }
  }
}
