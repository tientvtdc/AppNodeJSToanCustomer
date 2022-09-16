const puppeteer = require('puppeteer');
const fs = require('fs');
const cheerio = require('cheerio');

(async function main() {
    try {
        const browser = await puppeteer.launch({ headless: false });
        // const [page] = await browser.pages();
        const page = await browser.newPage();
        await page.setViewport({
            width: 1600,
            height: 900,
            deviceScaleFactor: 1,
        });
        const cookie = {
            name: 'myaloha_session',
            value: 'eyJpdiI6ImxDTGdEUEhnZ3F4UzhtZjZUY0RISUE9PSIsInZhbHVlIjoiZjVVMEh2cU1UaVJqbWpkNmk2ZDR4bk1RN3oxM1NwRkhvV0FwU1JpUmRHMFFra1FWazN6ZEZ2cWo0clpkMmxaVjFDbmNkaE1nZ0h1eEs1anUrTDM1a3dKWCtsR2pGd1VYMCtVcmJ4ZGtZSmJhanRubUFySlg0aVBpaC9scWkzclMiLCJtYWMiOiIyODljYWVjMmM4ZDkwYjc4ODk2YzUyZmI5Yjg5MTJmZjc0MDEwYTlkNTg1NzYwYTM4ZmQ2MTdmODQ5MDJjY2FiIiwidGFnIjoiIn0%3D', // replace this!
            domain: 'myaloha.vn',
            url: 'https://myaloha.vn',
            path: '/',
            httpOnly: true,
            secure: true,
        };

        await page.setCookie(cookie);
        await page.goto('https://myaloha.vn/cuoc-thi/giup-cac-em-lop-3-lop-4-lop-5-lop-6-lop-7-lop-8-lop-9-lop-10-3641', { waitUntil: 'networkidle0' });
        await page.waitForSelector('.play-join');
        await page.click('.play-join');
        // await page.waitForSelector('#additionInput');
        // await page.type('#additionInput', '20211', { delay: 100 });

        await page.evaluate(() => {
            document.querySelector('button[type=submit]').click();
        });

        await page.waitForTimeout(5000);
        const data = await page.evaluate(() => document.querySelector('body').outerHTML);
        // fs.writeFile('index.html', data, function (err) {
        //     if (err) return console.log(err);
        //     console.log('data > index.html');
        // });
        // console.log(data);
        const $ = cheerio.load(data);
        const arr = [];
        $('.content.quiz-content').each((index, el) => {
            const ob = new Object();
            ob['question'] = $(el).find('.description').text().trim();
            const anws = cheerio.load($(el).html());
            ob['answer'] = [];
            anws('.list-sheet-item').each((i, e) => {
                const number = anws(e).find('.number').text();
                const desc = anws(e).find('.desc').text();
                // console.log(number, desc);
                ob['answer'].push({ number, desc });
            });
            arr.push(ob);
            console.log(ob);
        })
        fs.writeFile('data.json', JSON.stringify(arr), function (err) {
            if (err) return console.log(err);
            console.log('data > data.json');
        });
        // console.log(data);
        // await browser.close();
    } catch (err) {
        console.error(err);
    }
})();