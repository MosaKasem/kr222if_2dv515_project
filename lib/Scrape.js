const request = require('request')
const reqProm = require('request-promise')
const cheerio = require('cheerio')

class Scrape {
    constructor(pageCount, page) {
        this.pageCount = pageCount || 200
        this.counter = 0
        this.links = []
        this.pages = []
        this.page = page || 'Java'
        this.wikiLink = 'https://en.wikipedia/wiki/'
    }
    scrape() {
        // while (this.counter < this.pageCount) {
            const resp = this.getLinks(`${this.wikiLink}${this.page}`)
            console.log('resp: ', resp);
        // }
    }
    getLinks(page) {
        return new Promise((resolve, reject) => {
            const data = 
        })
    }

}

module.exports = Scrape