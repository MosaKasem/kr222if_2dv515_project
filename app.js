const Scrape = require('./lib/Scrape')

const init = () => {
  const scrape = new Scrape(200)
  // const scrape = new Scrape(262)
  // const scrape = new Scrape(200)
  scrape.scrape()
}
init()
