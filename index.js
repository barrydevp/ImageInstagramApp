const puppeteer = require('puppeteer');
const fs = require('fs');
const download = require('image-downloader');

async function downloadIMG(options) {
  try {
    const { filename, image } = await download.image(options)
    console.log(filename) // => /path/to/dest/image.jpg
  } catch (e) {
    console.error(e);
  }
}

async function main() {
  //open new page, goto that page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const url = 'https://www.instagram.com/nara0318/';
  await page.goto(url);

  //create folder if it not exits
  if(!fs.existsSync('./images')) {
    fs.mkdirSync('./images');
  }

  //get image Attribute
  const imageSrcSets = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('article img'));
    const srcSetAttribute = imgs.map(item => item.getAttribute('srcset'));
    return srcSetAttribute;
  });

  await browser.close();
  
  //process and download image
  for(let i = 0; i < imageSrcSets.length; i++) {
    const srcSet = imageSrcSets[i];
    const splitedSrcs = srcSet.split(',');
    const imgSrc = splitedSrcs[splitedSrcs.length - 1].split(' ')[0];

    const options = {
      url: imgSrc,
      dest: './images'
    }
    downloadIMG(options);
  }
}

main();