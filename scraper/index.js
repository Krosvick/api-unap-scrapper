import fs from 'node:fs'
import puppeteer from 'puppeteer'
import beautify from "js-beautify"
import * as cheerio from 'cheerio'

const URLS = {
    transparencia: 'http://portal.unap.cl/~siperpro/app/app_transparencia',
}

const scrape = async (url) => {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(url)
    await page.waitForSelector('tbody')
    let data = await page.evaluate(() => document.body.innerHTML)
    data = cheerio.load(data)
    await browser.close()
    return data
}
const getFuncionarios = async () => {
    const $ = await scrape(URLS.transparencia)
    const $rows = $('table').eq(1).find('tr')

    //regex to remove first blank space from strings that have it
    const removeInitialBlank = text => text.replace(/^\s+/, '')

    //loop through each row
    //ignore the first row because it's the header
    $rows.each((i, el) => {
        if (i === 0) return
        const rawName = $(el).find('td').eq(0).text()
        const rawSede = $(el).find('td').eq(1).text()
        const rawRegion = $(el).find('td').eq(2).text()
        const rawEstudios = $(el).find('td').eq(3).text()
        const rawEstamento = $(el).find('td').eq(4).text()
        const rawCategoria = $(el).find('td').eq(5).text()
        const rawCargo = $(el).find('td').eq(6).text()
        const rawFuncion = $(el).find('td').eq(7).text()
        const rawTipoJornada = $(el).find('td').eq(8).text()
        const rawFInicio = $(el).find('td').eq(9).text()
        const rawFTermino = $(el).find('td').eq(10).text()
        const rawMes = $(el).find('td').eq(11).text()
        const rawRentaBruta = $(el).find('td').eq(12).text()
        const rawHExtras = $(el).find('td').eq(13).text()
        const rawHExtrasNocturnasFestivas = $(el).find('td').eq(14).text()
        const rawBonoUnap = $(el).find('td').eq(15).text()
        const rawBonoGobierno = $(el).find('td').eq(16).text()
        const rawAsigEspeciales = $(el).find('td').eq(17).text()
        const rawRentaLiquida = $(el).find('td').eq(18).text()
        const rawUMonetaria = $(el).find('td').eq(19).text()
        const rawObservaciones = $(el).find('td').eq(20).text()
        console.log({
            nCompleto: removeInitialBlank(rawName),
        })
    })
}

await getFuncionarios()

//get the second table

/*
const funcionarios = {
    nCompleto: "pepe",
    Sede: "sede",
    Región: "region",
    Estudios: ["estudios"],
    Estamento: "estamento",
    Categoria: "categoria",
    Cargo: "cargo",
    Función: "funcion",
    tipoJornada: "tipoJornada",
    fInicio: "fInicio",
    fTermino: "fTermino",
    mes: 1,
    rentaBruta: 1,
    hExtras: {
        hextras: 1,
        hextrasNocturnasFestivas: 1
    },
    bonos:{
        bonoUnap: 1,
        bonoGobierno: 1,
    },
    asigEspeciales:1,
    rentaBruta:1,
    rentaLiquida:1,
    uMonetaria:"uMonetaria",
    observaciones:"observaciones"
}
*/