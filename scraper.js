const fs = require('fs');
const path = require('path');
const scraper = require('scrape-it');
const json2csv = require('json2csv');
const moment = require('moment');

let url = 'http://www.shirts4mike.com/';

let csvTitles = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];

// check to see if the 'data' folder exists
// if not, make it
if(!fs.existsSync('data')) {
    fs.mkdir('data');
}

// use an sync function to scrape the hrefs from the initial page's links
const getLinks = async() => {
    return await scraper(url + 'shirts.php', {
        links: {
            listItem: '.products li a',
            data: {
                link: {
                    attr: 'href'
                }
            }
        }
    }).then(page => {
        return page.links.map(val => val.link);
    })
    .catch(err => {
        // On error, console.log it and write it to a file with timestamp
        console.log('Unable to connect to Mike\'s shirts! Error: ', err);
        let errorMessage = '\n' + moment().utc().format() + ' | ' + err;
        fs.appendFile('scraper-error.log', errorMessage, (logErr) => {
            if (logErr) throw err;
        })
    });
}

const scrapeShirts = () => {
    // set current date using moment
    let date = moment().format('YYYY-MM-DD');
    // create empty pages array
    let pages = [];
    // call getLinks which returns a promise to get the links from the
    // initial web page.
    // Then it takes those vals and maps over them to scrape that particular page for data
    getLinks().then(vals => {
        vals.map(val => {
            scraper(url + val, {
                Title: {
                    selector: 'h1',
                    // Only get the t-shirt title from the h1
                    convert: (x) => x.split('$')[1].slice(3)
                },
                Price: '.price',
                ImageURL: {
                    selector: 'img',
                    attr: 'src'
                }
            }).then(page => {
                page.Time = moment().format('YYYY-MMM-DD, h:mm:ss');
                page.URL = url + val;
                // push page onto pages array
                pages.push(page);
                // write pages array to the CSV
                json2csv({ data: pages, fields: csvTitles }, (err, csv) => {
                    fs.writeFile(path.join('data', `${date}.csv`), csv, (err) => {
                        if (err) throw err;
                        // console.log(page);
                    });
                });
            }).catch(err => {
                // On error, console.log it and write it to a file with timestamp
                console.log('Unable to connect to Mike\'s shirts! Error: ', err);
                let errorMessage = '\n' + moment().utc().format() + ' | ' + err;
                fs.appendFile('scraper-error.log', errorMessage, (logErr) => {
                    if (logErr) throw err;
                })
            });
        });
    })     
}
// call function
scrapeShirts();
