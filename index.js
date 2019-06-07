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
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  const url = 'https://www.instagram.com/nara0318/';
  await page.goto(url);

  //create folder if it not exits
  if(!fs.existsSync('./images')) {
    fs.mkdirSync('./images');
  }

  //scroll page
  // var test = await page.evaluate(async (count) => {
  //   return new Promise((resolve, reject) => {
  //     for(let i = 0; i < 10; i++)
  //       window.scrollBy(0, window.innerHeight);
  //     resolve(document.body.scrollHeight);
  //   });
  // });

  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
    /*\
      Explain why using setInterval:
        Khi browser hoạt động và scroll thì nó sẽ mất 1 khoảng thời gian trong lúc scroll vì vậy mà nếu
        ta sử dụng vòng lặp ở đây thì mặc dù chạy đủ số lần scroll nhưng vì là giữa các lần scroll sẽ tốn một khoàng
        nên nếu đang ở trong khoảng thời gian chờ scroll mà tiếp tục chạy scroll thì sẽ vô nghĩa
        Vì vậy sử dụng setInterval để chạy liên tục cho đến khi đủ scrollHeight thì dừng lại
        
    */
      // var scrollHeight = document.body.scrollHeight;
      // window.scrollBy(0, window.innerHeight);
      // while (scrollHeight < 4000) {
      //   window.scrollBy(0, window.innerHeight);
      //   scrollHeight = document.body.scrollHeight;
      // }
      // resolve();
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, window.innerHeight);
        if (scrollHeight >= 8000) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });

  //get image Attribute
  const imageSrcSets = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('article img'));
    const srcSetAttribute = imgs.map(item => item.getAttribute('srcset'));
    return srcSetAttribute;
  });

    await browser.close();
  
  // //process and download image
  // for(let i = 0; i < imageSrcSets.length; i++) {
  //   const srcSet = imageSrcSets[i];
  //   const splitedSrcs = srcSet.split(',');
  //   const imgSrc = splitedSrcs[splitedSrcs.length - 1].split(' ')[0];

  //   const options = {
  //     url: imgSrc,
  //     dest: './images'
  //   }
  //   downloadIMG(options);
  // }
}

main();