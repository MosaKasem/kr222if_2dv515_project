const Scrape = require('./lib/Scrape')

const init = () => {
  const scrape = new Scrape(3000)
  scrape.scrape()
}
init()
