const fs = require('fs');
const path = require('path');
const scraper = require('scrape-it');
const json2csv = require('json2csv');
const moment = require('moment');

let url = 'http://www.shirts4mike.com/shirt.php';

let csvTitles = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

// check to see if the 'data' folder exists
// if not, make it
if(!fs.existsSync('data')) {
    fs.mkdir('data');
}

const scrapeShirts = async () => {
    for(let i = 101; i <= 108; i++) {
        scraper(url + '?id=' + i, {
            Title: {
                selector: 'h1',
                convert: (x) => x.split('$')[1].slice(3)
            },
            Price: '.price',
            ImageURL: {
                selector: 'img',
                attr: 'src'
            }
        }).then(page => {
            page.Time = moment().format('YYYY-MMM-DD, h:mm:ss');
            page.URL = url + '?id=' + i;
            writeToCSV(page);
        });
    }
}

const writeToCSV = async (page) => {
    let csv = json2csv({ data: page, hasCSVColumnTitle: false });
    let date = moment().format('YYYY-MM-DD');

    fs.appendFile(path.join('data', `${date}.csv`), csv, (err) => {
        if (err) throw err;

    })
}

scrapeShirts();