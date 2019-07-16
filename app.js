const puppeteer = require('puppeteer');
const GoogleSpreadsheet = require('google-spreadsheet');
const { promisify } = require('util');
const creds = require('./client_secret.json');

async function getData() {
	const doc = new GoogleSpreadsheet(
		'1DXCArmf5m8e2X3rpmAERIunMO0G8-3_eTiz5CmfWGWo'
	);
	await promisify(doc.useServiceAccountAuth)(creds);
	const info = await promisify(doc.getInfo)();
	const sheet = info.worksheets[0];

	let BolURL =
		'https://www.bol.com/nl/s/computer/zoekresultaten/N/7111/sc/computer_all/index.html?searchtext=ssd+1tb&sort=price_l&view=list';
	let browser = await puppeteer.launch();
	let page = await browser.newPage();

	await page.goto(BolURL, { waitUntil: 'networkidle2' });

	let data = await page.evaluate(() => {
		let products = Array.from(
			document.querySelectorAll(
				'ul#js_items_content > li.product-item--row'
			)
		);

		return products.map(result => {
			return {
				brand: result.querySelector(
					'div.product-item__content > div.product-item__info.hit-area > ul.product-creator > li'
				).innerText,
				name: result.querySelector(
					'div.product-item__content > div.product-item__info.hit-area > div.product-title--inline > a'
				).innerText,
				link: result.querySelector(
					'div.product-item__content > div.product-item__info.hit-area > a'
				).href,
				price: result
					.querySelector(
						'div.product-item__content > div.product-item__options.hit-area > div.product-prices'
					)
					.innerText.replace(/\s+/g, ' ')
					.trim()
				//price: result.querySelector('div.product-item__content > div.product-item__options.hit-area > div.product-prices').innerText.replace(/\s+/g, " ").trim().split(' ').slice(0, 2).join()
			};
		});
		return products;
	});

	console.log(data);

	function pad(n) {
		return n < 10 ? '0' + n : n;
	}

	let currentDate = new Date();
	let date = currentDate.getDate();
	let month = currentDate.getMonth();
	let year = currentDate.getFullYear();
	let hours = currentDate.getHours();
	let minutes = currentDate.getMinutes();
	let seconds = currentDate.getSeconds();
	let formattedDate = `${pad(date)}/${pad(month + 1)}/${year}`;


	await data.forEach(element => {
		let actualPrice = element.price
			.split(' ')
			.slice(0, 2)
			.join();

		
		console.log(productFromSheet);

		if (actualPrice.includes('-')) actualPrice = actualPrice.replace('-', '00');
        if (actualPrice.includes('Niet leverbaar')) actualPrice = actualPrice.replace(',', ' ');
        
		console.log(actualPrice);

		const row = {
			date: formattedDate,
			productbrand: element.brand,
			productname: element.name,
			productlink: element.link,
			productprice: actualPrice
		};
		//promisify(sheet.addRow)(row);
		console.log(row);
		


	});

	await browser.close();
}

getData().catch(err => {
	console.log(err);
});