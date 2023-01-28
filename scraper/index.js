import fs from 'node:fs'
import puppeteer from 'puppeteer'
import beautify from "js-beautify"

const browser = await puppeteer.launch()
const page = await browser.newPage()
await page.goto('http://portal.unap.cl/~siperpro/app/app_transparencia')
await page.waitForSelector('tbody')
let data = await page.evaluate(() => document.body.innerHTML)
//beautify the html
data = beautify.html(data)
await browser.close()
fs.writeFileSync('data.html', data)
