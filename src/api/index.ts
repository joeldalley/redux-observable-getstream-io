import * as bodyParser from 'body-parser'
import * as express from 'express'
import * as GetStream from 'getstream'

type Req = express.Request
type Res = express.Response

const config = {
  port: 3000,
  getStream: {
    apiKey: String(process.env.API_KEY),
    apiKeySecret: String(process.env.API_KEY_SECRET),
    appId: String(process.env.APP_ID)
  }
}

////////////////////////////////////////////////////////////////

const app: express.Express = express()
app.use(bodyParser.json())

////////////////////////////////////////////////////////////////

const {apiKey, apiKeySecret, appId} = config.getStream
const client = GetStream.connect(apiKey, apiKeySecret, appId)

function CORSHeaders(res: Res) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  return res
}

////////////////////////////////////////////////////////////////

app.get('/ping', (_: Req, res: Res) => res.send('Pong'))

app.options('/key-and-id', (_: Req, res: Res) => CORSHeaders(res).send())

app.get('/key-and-id', (_: Req, res: Res) => {
  CORSHeaders(res).json({
    apiKey: config.getStream.apiKey,
    appId: config.getStream.appId,
  })
  console.log('API key and App ID fetched')
})

app.options('/token', (_: Req, res: Res) => CORSHeaders(res).send())

app.get('/token', (req: Req, res: Res) => {
  CORSHeaders(res)

  const {slug, userId} = req.query
  if (slug && userId) {
    res.json({token: String(client.feed(slug, userId).getReadOnlyToken())})
    console.log('Token fetched:', slug, userId)
  }
  else {
    res.status(400)
    res.json({error: 'A slug and userId are required'})
    console.log('A slug and userId are required')
  }
})

app.options('/add-activity', (_: Req, res: Res) => CORSHeaders(res).send())

app.post('/add-activity', (req: Req, res: Res) => {
  CORSHeaders(res)

  const {activity, feedConfig} = req.body
  if (activity && feedConfig) {
    const {slug, userId} = feedConfig
    const {actor, object, verb} = activity
    client.feed(slug, userId)
      .addActivity(activity)
      .then((msg: any) => res.json(msg))
      .catch((err: any) => res.json({error: `${err}`}))
    console.log('Added:', [actor, verb, object].join(' '))
    console.log('Slug & user ID:', slug, userId)
  }
  else {
    res.status(400)
    res.json({error: 'Activity missing'})
    console.log('Activity missing')
  }
})

////////////////////////////////////////////////////////////////

app.listen(config.port)
console.log(`Express server listening on port ${config.port}...`)
