const rp = require('request-promise')
const r = require('request')
const cheerio = require('cheerio')

class Scrape {
  constructor (pageCount, page) {
    this.pageCount = pageCount || 200
    this.counter = 0
    this.links = []
    this.pages = []
    this.page = page || 'Java'
    this.wikiLink = 'https://en.wikipedia.org/wiki/'
  }

  async scrape () {
    try {
      const resp = await this.getLinks(`${this.wikiLink}${this.page}`)
      console.log('resp: ', resp)
    } catch (error) {
      console.error(error.message)
    }
  }

  async getLinks (page) {
    const resp = r(page, (err, resp, html) => {
      console.log('err: ', err)
      console.log('resp: ', resp)
      if (!err && resp.statusCode === 200) {
        console.log('ha')
      }
    })
    // return cheerio.load(resp.body)
  }
}

module.exports = Scrape
