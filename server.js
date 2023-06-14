const express = require('express')
const cors = require('cors')
const cheerio = require('cheerio')
const axios = require('axios')

const players = require('./player.json')

const app = express()
app.use(cors())

const battingKeys = [
  'Matches',
  'Innings',
  'NotOuts',
  'Runs',
  'HighestScore',
  'Average',
  'BallsFaced',
  'StrikeRate',
  'hundreds',
  'doubleHundreds',
  'fifties',
  'fours',
  'sixes',
]
const bowlingKeys = [
  'Matches',
  'Innings',
  'Balls',
  'Runs',
  'Wickets',
  'BBI',
  'BBM',
  'Economy',
  'BowlingAverage',
  'BowlingSR',
  'fiveFors',
  'tenFors',
]

async function scrapData(id) {
  const response = await axios.get(`https://www.cricbuzz.com/profiles/${id}/`)
  const $ = cheerio.load(response.data)
  const tables = $('table')
  const result = []
  tables.each((idx, table) => {
    // result.push($(table).html())
    const tBody = $(table).find('tbody')
    const T20IStats = $(tBody).children()[2]
    result.push($(T20IStats).text())
  })

  return result
}

app.get('/', async (req, res) => {
  const player1 = players[Number(getRandomInt(0, players.length - 1))]
  const player2 = players[Number(getRandomInt(0, players.length - 1))]

  try {
    const result1 = await scrapData(player1.id)
    const stats1 = formatData(result1)
    const result2 = await scrapData(player2.id)
    const stats2 = formatData(result2)
    res.json({
      player1: {
        ...stats1,
        id: player1.id,
        country: player1.country,
        name: player1.name,
        img: `https://i.cricketcb.com/stats/img/faceImages/${player1.id}.jpg`,
      },
      player2: {
        ...stats2,
        id: player2.id,
        country: player2.country,
        name: player2.name,
        img: `https://i.cricketcb.com/stats/img/faceImages/${player2.id}.jpg`,
      },
    })
  } catch (error) {
    console.log(error)
  }
})

app.listen(3000, () => {
  console.log(`The server is spinning at the PORT 3000`)
})

function formatData(result) {
  const battingData = result[0].split(' ')
  const bowlingData = result[1].split(' ')
  const battingObj = {}
  const bowlingObj = {}
  for (let i = 2; i < battingKeys.length + 2; i++) {
    battingObj[battingKeys[i - 2]] = battingData[i]
  }
  for (let i = 2; i < bowlingKeys.length + 2; i++) {
    bowlingObj[bowlingKeys[i - 2]] = bowlingData[i]
  }
  return {
    batting: battingObj,
    bowling: bowlingObj,
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}
