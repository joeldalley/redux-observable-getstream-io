import * as React from 'react'
import * as ReactRedux from 'react-redux'
import * as Redux from 'redux'
const isEqual = require('lodash.isequal')

import {Action} from './action'
import {FeedStream} from '../lib/FeedStream'
import {Model} from './model'

function sentence(a: Partial<Model.StreamMessage>) {
  return [a.actor, a.verb, a.object].join(' ')
}

export namespace Component {
  interface StateProps {
    dispatch: Redux.Dispatch<Action.MessageStreamAction>
    streamState: Model.MessageStreamState
  }

  interface OwnProps {
    activity: Partial<Model.StreamMessage>
    feedConfig: FeedStream.FeedConfig
    styles: {[index: string]: string | number}
  }

  interface Props extends StateProps, OwnProps {
    clientConfig: FeedStream.ClientConfig
    stream: Model.MessageStream | undefined
  }

  interface Controls {
    label: string
    isIdle: () => string
    dispatchStart: () => void
    dispatchStop: () => void
  }

  class MessageStreamCore extends React.Component<Props> {
    componentWillMount() {
      const {activity, dispatch, feedConfig, streamState} = this.props
      if (!streamState.isFetchingConfig) {
        dispatch(Action.fetchConfig())
      }

      setInterval(() => {
        const stream = this.props.stream
        if (stream && stream.isProducing && !stream.isAdding) {
          dispatch(Action.addActivity(activity, feedConfig))
        }
        else {
          console.log('Message producer idle...')
        }
      }, 3000)
    }

    componentWillReceiveProps(nextProps: Props) {
      const lastConfig = this.props.streamState.config
      const nextConfig = nextProps.streamState.config
      if (!isEqual(lastConfig, nextConfig)) {
        nextProps.dispatch(Action.fetchToken(nextProps.feedConfig))
      }
    }

    componentWillUnmount() {
      const {dispatch, feedConfig} = this.props
      dispatch(Action.stopProducing(feedConfig))
      dispatch(Action.stopStreaming(feedConfig))
    }

    renderControls(controls: Controls) {
      const {backgroundColor} = this.props.styles
      const firstStyle = {float: 'left'}
      const theRestStyle = {float: 'left', marginLeft: '20px'}
      const clearStyle = {clear: 'both'}
      return (
        <div className='alert' style={{backgroundColor}}>
          <div>
            <b>{controls.label} Status:</b> {controls.isIdle()}
          </div>
          <div>
            <div style={firstStyle}>
              <b>Stream Controls:</b>
            </div>
            <div style={theRestStyle}>
              <button
                className='btn btn-success'
                onClick={controls.dispatchStart}>
                Start
              </button>
            </div>
            <div style={theRestStyle}>
              <button
                className='btn btn-danger'
                onClick={controls.dispatchStop}>
                Stop
              </button>
            </div>
            <div style={clearStyle}/>
          </div>
        </div>
      )
    }

    render() {
      const {clientConfig, dispatch, feedConfig, stream, styles} = this.props
      const {backgroundColor, ...otherStyles} = styles
      return (
        <div style={otherStyles}>
          {this.renderControls({
            label: 'Streaming',
            isIdle: () => !stream || !stream.isStreaming ? 'idle' : 'streaming',
            dispatchStart: () => dispatch(
              Action.startStreaming(clientConfig, feedConfig)
            ),
            dispatchStop: () => dispatch(Action.stopStreaming(feedConfig))
          })}
          {this.renderControls({
            label: 'Producing',
            isIdle: () => !stream || !stream.isProducing ? 'idle' : 'producing',
            dispatchStart: () => dispatch(
              Action.startProducing(clientConfig, feedConfig)
            ),
            dispatchStop: () => dispatch(Action.stopProducing(feedConfig))
          })}
          {stream && stream.messages.map((msg, idx) => (
            <div className='alert' key={idx} style={{backgroundColor}}>
              {sentence(msg)} @ {msg.time.toString()}
            </div>
          ))}
        </div>
      )
    }
  }

  const map = (state: StateProps, props: OwnProps): Props => {
    const config = state.streamState.config
    const key = FeedStream.getKey(props.feedConfig)
    return {
      activity: props.activity,
      clientConfig: config,
      dispatch: state.dispatch,
      feedConfig: props.feedConfig,
      stream: key in state.streamState.streams
        ? state.streamState.streams[key]
        : undefined,
      streamState: state.streamState,
      styles: Object(props.styles)
    }
  }
  export const MessageStream = ReactRedux.connect(map)(MessageStreamCore)
}
