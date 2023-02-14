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
        nCompleto: {selector:'td:nth-child(1)'},
        sede: {selector:'td:nth-child(2)'},
        region: {selector:'td:nth-child(3)'},
        estudios: {selector:'td:nth-child(4)'},
        
        estamento: {selector:'td:nth-child(5)'},
        categoria: {selector:'td:nth-child(6)'},
        cargo: {selector:'td:nth-child(7)'},
        funcion: {selector:'td:nth-child(8)'},
        tipoJornada: {selector:'td:nth-child(9)'},
        fInicio: {selector:'td:nth-child(10)'},
        fTermino: {selector:'td:nth-child(11)'},
        mes: {selector:'td:nth-child(12)', typeOf: 'number'},
        rentaBruta: {selector:'td:nth-child(13)', typeOf: 'number' },
        hextras: {
            hextras: {selector: 'td:nth-child(14)', typeOf: 'number'},
            hextrasNocturnasFestivas: {selector: 'td:nth-child(15)', typeOf: 'number'},
        },
        bonos:{
            bonoUnap: {selector: 'td:nth-child(16)', typeOf: 'number'},
            bonoGobierno: {selector: 'td:nth-child(17)', typeOf: 'number'},
        },
        asigEspeciales: {selector:'td:nth-child(18)'},
        rentaBrutaMensualizada: {selector:'td:nth-child(19)', typeOf: 'number'},
        rentaLiquida: {selector:'td:nth-child(20)', typeOf: 'number'},
        uMonetaria: {selector:'td:nth-child(21)'},
        observaciones: {selector:'td:nth-child(22)'},
    }

    //regex to remove first blank space from strings that have it
    //also will clean the text to /n or /t and other special characters
    const cleanText = (text) => {
        return text.replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ')
    }
    //remove dots from numbers
    const cleanNumber = (number) => {
        return number.replace(/\./g, '')
    }

    //loop through each row
    //ignore the first row because it's the header
    $rows.each((i, el) => {
        const $el = $(el)
        if (i === 0) return
        const funcionariosEntries = Object.entries(FUNCIONARIOS_SELECTORS).map(([key, {selector, typeOf}]) => {
            const value = $el.find(selector).text()
            if (typeOf === 'number') return [key, Number(cleanNumber(cleanText(value)))]
            return [key, cleanText(value)]
        })
        console.log(Object.fromEntries(funcionariosEntries))
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