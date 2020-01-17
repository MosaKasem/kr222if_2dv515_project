const rp = require('request-promise')
const r = require('request')
const cheerio = require('cheerio')
const fs = require('fs')

class Scrape {
  constructor (pageCount, page) {
    this.pageCount = pageCount || 200
    this.counter = 0
    this.counterTwo = 0
    this.links = []
    this.pages = []
    this.page = page || 'java'
    this.rawHTML = []
    this.wikiLink = 'https://en.wikipedia.org/wiki/'
  }

  async scrape () {
    // try {
    await this.getLinks(`${this.wikiLink}${this.page}`)
    while (this.links.length < this.pageCount) { // incase first link doesnt have minimum required links
      for (const page of this.links) {
        if (this.links.length >= this.pageCount) {
          console.log('this.pageCount: ', this.pageCount)
          console.log('break!')
          break
        } else {
          await this.getLinks(`https://en.wikipedia.org${page}`)
        }
        console.log('We are here')
      }
      console.log(this.links.length)
    }
    // await this.scrapeBody()
    // await this.printContent()
    // await this.printRawContent()
    await this.printLink()
    // } catch (error) {
    //   console.error(error)
    // }
  }

  async getLinks (page) {
    try {
      const resp = await rp(page, async (err, res, htm) => {
        if (!err && res.statusCode === 200) {
          const $ = cheerio.load(htm)
          $('a').each((index, link) => {
            if (this.links.length !== this.pageCount && !this.links.includes(link)) {
              const currentLink = $(link).attr('href')
              if (currentLink !== undefined && currentLink.includes('/wiki/') && !currentLink.includes(':')) {
                this.links.push(currentLink)
              }
            } else if (this.links.length <= this.pageCount) {
              return -1
            }
          })
        }
      })
      console.log('links: ', this.links.length)
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
        if (this.pages.length <= this.pageCount) {
          this.counterTwo++
          // console.log('Pages :', this.pages.length)
          resp = await this.scrapeContent(`https://en.wikipedia.org${page}`)
        } else {
          return Promise.resolve(resp)
        }
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
          this.rawHTML.push($.html())
          const body = $('div', '.mw-parser-output')
          // meta flags matches
          // https://regex101.com/
          // d (0-9)
          // w (a-zA-Z, 0-9 and _'s)
          // s (whitespace (space, tabs))
          // t tabs
          /** (+ one or more) (\escape) ([the character set]) ([^] reverse character set) */
          const text = body.text()
            .replace(/(?:")(.*?)(?:")/ig, '') // (?:")(.*?)(?:")
            .replace(/<[^>]*>/ig, '') // <[^>]*>
            .replace(/[\W_]+/ig, ' ')
            .replace(/[.+^\s.+]/ig, ' ')

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

  async printRawContent () {
    try {
      this.links.forEach((link, i) => {
        const file = link.replace(/[/wiki/]/gm, '')
        const body = this.rawHTML[i]
        this.writeTheFileRaw(file, body)
      })
    } catch (err) {
      console.error(err)
    }
  }

  async linksGenerator (link) {
    const arrOfLinks = []
    try {
      await rp(this.wikiLink + link, async (err, res, htm) => {
        if (!err && res.statusCode === 200) {
          const $ = cheerio.load(htm)
          $('a').each((index, link) => {
            if (arrOfLinks.length !== this.pageCount && !arrOfLinks.includes(link)) {
              const currentLink = $(link).attr('href')
              if (currentLink !== undefined && currentLink.includes('/wiki/') && !currentLink.includes(':')) {
                arrOfLinks.push(currentLink)
              }
            } else if (arrOfLinks.length <= this.pageCount) {
              return -1
            }
          })
        }
      })
      return Promise.resolve(arrOfLinks)
    } catch (err) {
      return false
    }
  }

  async printLink () {
    try {
      this.links.forEach(async (link, i) => {
        const file = link.replace(/[/wiki/]/gm, '')
        const arrOfLinks = await this.linksGenerator(file)
        this.writeTheLinks(file, arrOfLinks)
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

  writeTheLinks (linkName, content) {
    if (content !== false) {
      let str = ''
      Object.values(content).forEach((key, i) => {
        str += key + '\n'
      })
      // content.replace(/[,]/g, '\n')
      fs.writeFile('./wikipedia/Links/' + linkName, str, (err) => {
        if (err) console.log(err)
      })
    }
  }

  writeTheFileRaw (fileName, content) {
    fs.writeFile('./wikipedia/Raw/' + fileName, content, (err) => {
      if (err) console.log(err)
    })
  }
}

module.exports = Scrape
