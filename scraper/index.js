import fs from 'node:fs'
import puppeteer from 'puppeteer'


const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.goto('http://portal.unap.cl/~siperpro/app/app_transparencia')
await page.waitForSelector('tbody')
const data = await page.evaluate(() => {
    const tbody = document.querySelector('tbody')
    return tbody?.textContent
})
await browser.close()
//save the result to a file
fs.writeFileSync('data.txt', data)