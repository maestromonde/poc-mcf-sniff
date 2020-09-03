const chrome = require('chrome-aws-lambda');

const SELECTORS = {
    MCF_NIR_INPUT: '#nir-form > mat-form-field > div > div.mat-form-field-flex > div > input',
    MCF_PASSWORD_INPUT: '#motDePasse-form > div > mat-form-field > div > div.mat-form-field-flex > div.mat-form-field-infix > input',
    MCF_CONNECT_BTN: '#main > section:nth-child(2) > div > div > div.col-lg-6.d-flex.justify-content-start.pt-2.border-right.border-blue-ligher-4 > div > form > button'
};

async function fetchCounter(nir = null, password = null) {
    if (!nir || nir.length < 13 || !password) {
        return false;
    }

    const browser = await chrome.puppeteer.launch({
        args: chrome.args,
        defaultViewport: chrome.defaultViewport,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
        ignoreHTTPSErrors: true,
    });
    console.log('browser')
    const page = await browser.newPage();
    console.log('page')
    await page.goto("https://www.moncompteformation.gouv.fr/espace-prive/html/#/compte-utilisateur/connexion");

    await page.waitForSelector(SELECTORS.MCF_CONNECT_BTN);
    console.log('nav + btn ok')

    await page.type(SELECTORS.MCF_NIR_INPUT, nir);
    await page.type(SELECTORS.MCF_PASSWORD_INPUT, password);
    console.log('typed')

    await page.click(SELECTORS.MCF_CONNECT_BTN);
    console.log('clicked')
    const connectReq = await page.waitForResponse((request) =>
        request.url().includes("local/login/titulaire")
    );
    const connect = await connectReq.json();
    console.log('connect req');
    console.log(connect);

    if (connect.typeError) {
        return { error: connect.typeError };
    }

    const cpfReq = await page.waitForResponse(request => request.url().includes("private/titulaire/me/droits/cpf"));
    console.log('request hijacked');

    const CPF = await cpfReq.json();
    console.log(CPF);
    try {
        return CPF.compteurPrive.total;
    } finally {
        await browser.close();
    }
}

module.exports = { fetchCounter };
