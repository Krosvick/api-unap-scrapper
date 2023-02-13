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

    const FUNCIONARIOS_SELECTORS = {
        nCompleto: 'td:nth-child(1)',
        sede: 'td:nth-child(2)',
        region: 'td:nth-child(3)',
        estudios: 'td:nth-child(4)',
        estamento: 'td:nth-child(5)',
        categoria: 'td:nth-child(6)',
        cargo: 'td:nth-child(7)',
        funcion: 'td:nth-child(8)',
        tipoJornada: 'td:nth-child(9)',
        fInicio: 'td:nth-child(10)',
        fTermino: 'td:nth-child(11)',
        mes: 'td:nth-child(12)',
        rentaBruta: 'td:nth-child(13)',
        hextras: 'td:nth-child(14)',
        hextrasNocturnasFestivas: 'td:nth-child(15)',
        bonoUnap: 'td:nth-child(16)',
        bonoGobierno: 'td:nth-child(17)',
        asigEspeciales: 'td:nth-child(18)',
        rentaLiquida: 'td:nth-child(19)',
        uMonetaria: 'td:nth-child(20)',
        observaciones: 'td:nth-child(21)',
    }

    //regex to remove first blank space from strings that have it
    //also will clean the text to /n or /t and other special characters
    const cleanText = (text) => {
        return text.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ')
    }

    //loop through each row
    //ignore the first row because it's the header
    $rows.each((i, el) => {
        const $el = $(el)
        if (i === 0) return
        const funcionariosEntries = Object.entries(FUNCIONARIOS_SELECTORS).map(([key, selector]) => {
            const value = $el.find(selector).text()
            return [key, cleanText(value) ]
        })
        console.log(funcionariosEntries)
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