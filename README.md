# redux-observable-getstream-io

[About](#about)<br/>
[Clone and Install](#clone-and-install)<br/>
[Add GetStream Details](#add-getstream-details)<br/>
[Fix Typescript Declaration Files](#fix-typescript-declaration-files)<br/>
[API Server](#api-server)<br/>
[Single-page App](#single-page-app)<br/>
[License](#license)<br/>

## About

Demonstrate a [Redux-Observable](https://redux-observable.js.org/) [Epic](https://redux-observable.js.org/docs/basics/Epics.html) that emits message-received actions from a real-time [getstream.io](getstream.io) client feed subscription. The message-received action stream is started by sending the Epic a start action and stopped by sending it a stop action.

Source code for the Epic, [streamMessages](https://github.com/joeldalley/redux-observable-getstream-io/blob/master/src/app/epic.ts#L83).

#### How Epics Work

A Redux-Observable program models asynchronous actions like fetching data from API servers as Epics. An Epic is a function that receives as its argument an action stream and produces as its output an action stream.

Since a GetStream client feed subscription is a stream of messages and is therefore asynchronous, it gets modeled as an Epic in a Redux-Observable program.

#### Program Architecture

A [Redux](https://redux.js.org/) program is one that listens for events called actions and responds to actions by applying registered functions called reducers. Every reducer receives as its arguments the previous application state and an action, and produces as its output the next application state.

Components respond to changes in application state according to how Redux state properties are mapped to component props. Component responses to changes in Redux state are synchronous, allowing actions to be dispatched in a controlled order.

In a Redux program, components can dispatch actions in lifecycle functions. And user-generated events can be captured as actions by dispatching from the events' callbacks. In a Redux-Observable program, a third source of actions is introduced in the form of Epics.

This architecture imparts many benefits, and luckily it's easy to use [RxJS](http://reactivex.io/rxjs/) to transform GetStream's feed subscription into an Observable, which can be leveraged in Epics by mapping received messages to Redux actions.

###### Architecture Diagram
```sh
                         |
                         v
     +-------- React Root Element Render
     |                   |  
     v                   v            
    All              Connected
    Other            Components       +--> Actions
    Components           |           /  Epics   /
     |                   v          /          / <---> FeedStream
     |          +---- Reducers <---+ <--------+        used in one
     |          |                  ^                   or more Epics.
     |          v                  |
     |        State             Actions                FeedStream is
     |          |                  ^                   stateful in that
     |          |                  |                   it holds open one or
     +--------> +---> Render ------+                   more clients, one or
                                   ^                   more subscriptions,
                               ____|_____              and an one or more
                              (  Events  )             Rx Subjects.
                              (__________)
```
Source code for the Singleton, [FeedStream](https://github.com/joeldalley/redux-observable-getstream-io/blob/master/src/lib/FeedStream.ts).

## Clone and Install

```sh
git clone git@github.com:joeldalley/redux-observable-getstream-io.git
cd redux-observable-getstream-io && npm install
```
## Add GetStream Details

After creating a free [getstream.io](getstream.io) account, you will be able to create three files required for this app to work. In the GetStream dashboard, locate your app ID, API key and API key secret. Then, in the project root:

```sh
echo YOUR_APP_ID > .app-id
echo YOUR_API_KEY > .api-key
echo YOUR_API_KEY_SECRET > .api-key-secret
```
The contents of these dot-files will be exported as ENV vars, for use by the GetStream API server.

## Fix Typescript Declaration Files

I updated two declaration files in node_modules, to get things working. (26/Nov/2017)

#### VirtualTimeScheduler

In running `npm run build`, if you get the following error:

```sh
node_modules/rxjs/scheduler/VirtualTimeScheduler.d.ts(22,22):
  error TS2415: Class 'VirtualAction<T>' incorrectly extends
                base class 'AsyncAction<T>'.
    Types of property 'work' are incompatible.
  ...
```

Comment out the `work` declaration as shown, to fix:

```javascript
...
export declare class VirtualAction<T> extends AsyncAction<T> {
    protected scheduler: VirtualTimeScheduler;
    //protected work: (this: VirtualAction<T>, state?: T) => void;
    protected index: number;
    protected active: boolean;
    ...
```

#### GetStream

In running `npm run build`, if you get the following error:

```sh
src/lib/FeedStream.ts(21,44):
  error TS2694: Namespace '"node_modules/getstream/types/getstream/index"'
                has no exported member 'Feed'.
```

In the file, `node_modules/getstream/types/getstream/index.d.ts`,
change the Feed declaration to be exported as shown, to fix:

```javascript
export declare class Feed {
  /** Construct Feed. */
  constructor(
    client: StreamClient,
    feedSlug: string,
    userId: string,
    token: string
  );
```

And if you get the following error:

```sh
src/lib/FeedStream.ts(84,26):
  error TS2345: Argument of type '(msg: any) => void' is not
                assignable to parameter of type '() => void'.
```

In the file, `node_modules/getstream/types/getstream/index.d.ts`,
change the `subscribe` declaration as shown, to fix:

```javascript
// Subscribe to realtime
 /** Subscribe to Faye realtime source. */
 subscribe(callback: (msg: any) => void): object;
```

## API Server

Run the GetStream API server with `npm run start-server`.

## Single-page App

Execute `npm run webpack`, then visit [file:///path/to/redux-observable-getstream-io/index.html](file:///path/to/redux-observable-getstream-io/index.html) in your browser.

## License
redux-observable-getstream-io is distributed under the MIT license.
