import {Observable} from 'rxjs/Observable'
import * as ReduxObservable from 'redux-observable'
import * as Rx from 'rxjs/Rx'

import {FeedStream} from '../lib/FeedStream'
import * as Get from '../lib/getOrElse'
import {Action} from './action'

const API_HOST: string = 'http://localhost:3000'

type InStream = ReduxObservable.ActionsObservable<Action.MessageStreamAction>
type OutStream = Observable<Action.MessageStreamAction>

export namespace Epic {
  export function addActivity(action$: InStream): OutStream {
    return action$
      .ofType(Action.Types.MessageStream.ADD_ACTIVITY)
      .mergeMap((action: Action.MessageStreamAction) => {
        const {activity, feedConfig} = action
        if (activity && feedConfig) {
          const {actor, object, verb} = activity
          const request = {
            body: {
              activity: {actor, object, verb},
              feedConfig
            },
            headers: {'Content-Type': 'application/json'},
            method: 'POST',
            url: API_HOST + '/add-activity'
          }
          return Rx.Observable.ajax(request)
            .flatMap((msg: any) => {
              if (Object(msg).status !== 200) {
                throw 'Error: activity was not added'
              }
              return [Action.addActivityCompleted(feedConfig)]
            })
            .catch((err: any) => [Action.error(`${err}`, feedConfig)])
        }
        else if (!feedConfig) {
          return [Action.errorNoFeed('A FeedConfig is required!')]
        }
        else {
          return [Action.error('An Activity is required!', feedConfig)]
        }
      })
  }

  export function fetchKeyAndId(action$: InStream): OutStream {
    return action$
      .ofType(Action.Types.Config.FETCH_KEY_AND_ID)
      .concatMap(() => {
        return Rx.Observable.ajax(`${API_HOST}/key-and-id`)
          .map((msg: any) => {
            const json = Get.objectOr(Object(msg), 'response')
            return Action.fetchConfigCompleted({keyAndId: json})
          })
          .catch((err: any) => [Action.errorNoFeed(`${err}`)])
      })
  }

  export function fetchToken(action$: InStream): OutStream {
    return action$
      .ofType(Action.Types.Config.FETCH_TOKEN)
      .concatMap((action: Action.MessageStreamAction) => {
        const {feedConfig} = action
        if (feedConfig) {
          const {slug, userId} = feedConfig
          const url = `${API_HOST}/token?slug=${slug}&userId=${userId}`
          return Rx.Observable.ajax(url)
            .map((msg: any) => {
              const json = Get.objectOr(Object(msg), 'response')
              return Action.fetchTokenCompleted(feedConfig, json)
            })
            .catch((err: any) => [Action.errorNoFeed(`${err}`)])
        }
        else {
          return [Action.errorNoFeed('A FeedConfig is required!')]
        }
      })
  }

  export function streamMessages(action$: InStream): OutStream {
    const {START_STREAMING, STOP_STREAMING} = Action.Types.MessageStream
    return action$
      .ofType(START_STREAMING)
      .mergeMap((action: Action.MessageStreamAction) => {
        const {config, feedConfig} = action
        if (config && feedConfig) {
          const {error, stream} = FeedStream.Factory.getStream(config, feedConfig)
          if (stream && !error) {
            return Rx.Observable.concat(
              [Action.startStreamingCompleted(feedConfig)],
              stream
                .map((msg: any) => {
                  const msgs = Get.arrayOr(Object(msg), 'new')
                  return Action.receive({new: msgs}, feedConfig)
                })
                .catch((err: any) => [Action.error(`${err}`, feedConfig)])
                .takeUntil(action$.filter(_ => {
                  return _.type === STOP_STREAMING
                      && _.feedConfig !== undefined
                      && feedConfig.slug === _.feedConfig.slug
                      && feedConfig.userId === _.feedConfig.userId
                }))
            )
          }
          return [Action.error(error, feedConfig)]
        }
        else {
          const msg = 'A ClientConfig and a FeedConfig are required!'
          return [Action.errorNoFeed(msg)]
        }
      })
  }
}
