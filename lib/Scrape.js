const rp = require('request-promise')
const r = require('request')
const cheerio = require('cheerio')
const fs = require('fs')

class Scrape {
  constructor (pageCount, page) {
    this.pageCount = pageCount || 200
    this.counter = 0
    this.links = []
    this.pages = []
    this.page = page || 'Java'
    this.rawHTML = []
    this.wikiLink = 'https://en.wikipedia.org/wiki/'
  }

  async scrape () {
    try {
      const resp = await this.getLinks(`${this.wikiLink}${this.page}`)
      const scra = await this.scrapeBody()
      const body = await this.printContent()
    } catch (error) {
      console.error(error)
    }
  }

  async getLinks (page) {
    try {
      const resp = await rp(page, async (err, res, htm) => {
        if (!err && res.statusCode === 200) {
          const $ = cheerio.load(htm)
          $('a').each((index, link) => {
            if (this.links.length !== this.pageCount) {
              const currentLink = $(link).attr('href')
              if (currentLink !== undefined && currentLink.includes('/wiki/') && !currentLink.includes(':')) {
                this.links.push(currentLink)
              }
            }
          })
        }
      })
      return Promise.resolve(resp)
    } catch (err) {
      console.error(err)
      return false
    }
  }

  async scrapeBody () {
    try {
      let resp
      for (const page of this.links) {
        resp = await this.scrapeContent(`https://en.wikipedia.org${page}`)
      }
      return Promise.resolve(resp)
    } catch (err) {
      console.error(err)
      return false
    }
  }

  async scrapeContent (page) {
    try {
      const resp = await rp(page, async (err, res, htm) => {
        if (!err && res.statusCode === 200) {
          const $ = cheerio.load(htm)
          const body = $('body')
          const text = body.text().replace(/[\t\n\r]/gm, '')
          this.pages.push(text)
        } else {
          throw err
        }
      })
      return Promise.resolve(resp)
    } catch (err) {
      console.error(err)
      return Promise.reject(err)
    }
  }

  async printContent () {
    try {
      this.links.forEach((link, i) => {
        const file = link.replace(/[/wiki/]/gm, '')
        const body = this.pages[i]
        this.writeTheFile(file, body)
      })
    } catch (err) {
      console.error(err)
    }
  }

  writeTheFile (fileName, content) {
    fs.writeFile('./wikipedia/Words/' + fileName, content, (err) => {
      if (err) console.log(err)
    })
  }
}

module.exports = Scrape
