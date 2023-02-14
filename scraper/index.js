import {writeFile} from 'node:fs/promises'
import puppeteer from 'puppeteer'
import * as cheerio from 'cheerio'
import path from 'node:path'

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
        nombreCompleto: {selector:'td:nth-child(1)'},
        sede: {selector:'td:nth-child(2)'},
        region: {selector:'td:nth-child(3)'},
        //with cheerio i want to set selector as the content of the title attribute of the span
        estudios: {selectorprev:'td:nth-child(4) a span'},
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
            selector:{
                hextras: {selector: 'td:nth-child(14)'},
                hextrasNocturnasFestivas: {selector: 'td:nth-child(15)'},
            }
        },
        bonos:{
            selector:{
                bonoUnap: {selector: 'td:nth-child(16)', typeOf: 'number'},
                bonoGobierno: {selector: 'td:nth-child(17)', typeOf: 'number'},
            }
        },
        asigEspeciales: {selector:'td:nth-child(18)'},
        rentaBrutaMensualizada: {selector:'td:nth-child(19)', typeOf: 'number'},
        rentaLiquida: {selector:'td:nth-child(20)', typeOf: 'number'},
        uMonetaria: {selector:'td:nth-child(21)'},
        observaciones: {selector:'td:nth-child(22)'},
    }

    //regex to remove first blank space from strings that have it
    //also will clean the text to /n or /t and other special characters
    //if there are <br><br />tags, it will replace them with commas
    const cleanText = (text) => {
        return text.replace(/^\s+|\s+$/g, '').replace(/\n|\t/g, '').replace(/<br \/>/g, ',')
    }
    //remove dots from numbers
    const cleanNumber = (number) => {
        return number.replace(/\./g, '')
    }
    const numberConverter = (number) => {
       //first clean the number
         number = cleanNumber(cleanText(number))
        //if the number is empty, return 0
        if (number === '') return 0
        //if nan return 0
        if (isNaN(number)) return 0
        //if number have commas, it's a float
        if (number.includes(',')) return parseFloat(number)
        //if number doesn't have commas, it's an integer
        return parseInt(number)
    }

    //loop through each row
    //ignore the first row because it's the header
    const funcionarios = []
    $rows.each((i, el) => {
        const $el = $(el)
        if (i === 0) return
        const funcionariosEntries = Object.entries(FUNCIONARIOS_SELECTORS).map(([key, {selector, selectorprev, typeOf}]) => {
            const value = $el.find(selector).text()
            if (typeOf === 'number') return [key, Number(numberConverter(value))]
            if (selectorprev){
                try {
                    return [key, cleanText($el.find(selectorprev).attr('title'))]
                }
                catch (e) {
                    return [key, '']
                }

            }
            //check if the selector is a nested object
            if (typeof selector === 'object'){
                const nestedEntries = Object.entries(selector).map(([nestedKey, {selector, typeOf}]) => {
                    const nestedValue = $el.find(selector).text()
                    if (typeOf === 'number') return [nestedKey, Number(numberConverter(nestedValue))]
                    return [nestedKey, cleanText(nestedValue)]
                })
                return [key, Object.fromEntries(nestedEntries)]
            }
            return [key, cleanText(value)]
        })
        funcionarios.push(Object.fromEntries(funcionariosEntries))
    })
    return funcionarios
}
const funcionarios = await getFuncionarios()
const filePath = path.join(process.cwd(), './db/funcionarios.json')
await writeFile(filePath, JSON.stringify(funcionarios, null, 2), 'utf-8')
console.log(funcionarios)
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