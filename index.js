const puppeteer = require('puppeteer');
const download = require('image-downloader');
require('dotenv').config();

(async() => {
    const browser = await puppeteer.launch({
        headless: false
    });
    console.log('Browser openned');
    const page = await browser.newPage();
    await page.setViewport({width: 200, height: 200});
    await page.setDefaultNavigationTimeout(0); 
    const url = 'https://kenh14.vn/dai-chien-bikini.html';
    await page.goto(url);
    console.log('Page loaded');

    const imgLinks = await page.evaluate(() => {
        let imgElements = document.querySelectorAll('div.slide-thumb > i');
        imgElements = [...imgElements];
        let imgLinks = imgElements.map(i => i.style.backgroundImage.slice(4, -1).replace(/"/g, ""));
        return imgLinks;
    });

    // ảnh đại diện
    await Promise.all(imgLinks.map(imgUrl => download.image({
        url: imgUrl,
        dest: __dirname+'/img/kenh14',
    })));

    const linkInstagrams = await page.evaluate(() => {
        let linkInta = document.querySelectorAll('div.user-total > a');
        linkInta = [...linkInta];
        let intaLinks = linkInta.map(i => i.getAttribute('href'));
        return intaLinks;
    });
    console.log(linkInstagrams);

    //login instagram
    let loginPage = "https://www.instagram.com/accounts/login/";
	console.log('Browser login');
	const pageLogin = await browser.newPage();
    await pageLogin.setDefaultNavigationTimeout(0); 
    await pageLogin.goto(loginPage, { waitUntil: "networkidle2" });
    await pageLogin.waitForSelector('input[name="username"]', {
		visible: true,
		timeout: 5000
	});

	await pageLogin.type('input[name="username"]',  process.env.USER_NAME , {delay: 50});
	await pageLogin.type('input[name="password"]', process.env.PASSWORD, {delay: 50});
	await pageLogin.click('button[type="submit"]');
	await pageLogin.waitForNavigation({ waitUntil: "networkidle2" });
  	console.log("login success");


  	for(let i = 0; i < 3; i++){
  		let link = linkInstagrams[i];
  		const pageProfileInstagram = await browser.newPage();
  			await pageProfileInstagram.setViewport({width: 200, height: 200});
		await pageProfileInstagram.goto(link);

	    const imgLinks = await pageProfileInstagram.evaluate(() => {
	        let imgElements = document.querySelectorAll('div.KL4Bh > img');
	        imgElements = [...imgElements];
	        let imgLinks = imgElements.map(i => i.getAttribute('src'));
	        return imgLinks;
	    });
	    console.log(link);
	    console.log(imgLinks);

	    // Tải các ảnh này về thư mục hiện tại
	    await Promise.all(imgLinks.map(imgUrl => download.image({
	        url: imgUrl,
	        dest: __dirname+"/img/inta/",
	    })));
  	}


   			

    

    await browser.close();
})();
