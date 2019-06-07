//import library
const puppeteer = require('puppeteer');
const fs = require('fs');
const download = require('image-downloader');

//variable
const url = 'https://www.instagram.com/nara0318/';

function getIdInstagram(url) {
  let arr = url.split('/');
  arr.pop();
  const Id = arr.pop();
  return Id;
}

async function getImageSrcsetFromUrl(url) {
  //open new page, goto that page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  //scroll page
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      /*\
        Explain why using setInterval:
          Khi browser hoạt động và scroll thì nó sẽ mất 1 khoảng thời gian trong lúc scroll vì vậy mà nếu
          ta sử dụng vòng lặp ở đây thì mặc dù chạy đủ số lần scroll nhưng vì là giữa các lần scroll sẽ tốn một khoàng
          nên nếu đang ở trong khoảng thời gian chờ scroll mà tiếp tục chạy scroll thì sẽ vô nghĩa
          Vì vậy sử dụng setInterval để chạy liên tục cho đến khi đủ scrollHeight thì dừng lại
          
      */
      var maxScrollHeight = 8000;
      var time = 100; //time per each run of interval, the value is miliseconds
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, window.innerHeight);
        if (scrollHeight >= maxScrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, time);
    });
  });

  //get image Attribute
  const imageSrcSets = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('article img'));
    const srcSetAttribute = imgs.map(item => item.getAttribute('srcset'));
    return srcSetAttribute;
  });

  //close page
  await browser.close();

  return imageSrcSets;
}

async function downloadIMG(options) {
  // try {
  //   const { filename, image } = await download.image(options)
  //   console.log(filename) // => /path/to/dest/image.jpg
  // } catch (e) {
  //   console.error(e);
  // }
  const { filename, image } = await download.image(options)
  console.log(filename) // => /path/to/dest/image.jpg
}

function getLargestImageFromSrcSet(srcSet) {
  const splitedSrcs = srcSet.split(',');
  const imgSrc = splitedSrcs[splitedSrcs.length - 1].split(' ')[0];
  return imgSrc; 
}

async function downloadImgFromUrl(url) {
  const idInstagram = getIdInstagram(url);
  //create folder if it not exits
  if (!fs.existsSync('./images/' + idInstagram)) {
    fs.mkdirSync('./images/' + idInstagram);
  }
  const imageSrcSets = await getImageSrcsetFromUrl(url);
  
  //process and download image
  imageSrcSets.forEach(item => {
    const srcSet = item;
    const imgSrc = getLargestImageFromSrcSet(srcSet);

    const options = {
      url: imgSrc,
      dest: './images/' + idInstagram
    }
    downloadIMG(options);
  });

}

async function main() {
  //downloadImgFromUrl(url);
  try {
    await downloadImgFromUrl(url);
    console.log('Download Done!');
  } catch(e) {
    console.log(e);
  }
}

main();