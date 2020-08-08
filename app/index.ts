import puppeteer from 'puppeteer';
import path from 'path';
import { ROOT_PATH } from './const';

const SELECTORS = {
    MCF_FRANCE_CONNECT_LOGIN: "#main > section:nth-child(1) > div > div > div > sl6-login-fc > div > img",

    FC_DGFIP: "#fi-dgfip",
    FC_CONTNUE_LOGIN: "body > main > form > button",

    DGFIP_FISCAL_NUMBER_INPUT: "#spi_tmp",
    DGFIP_PASSWORD_INPUT: "#fg_pwd[aria-hidden=false] #pwd_tmp",
    DGFIP_LOGIN_BTN: "#btnAction",
};

(async () => {
    try {
        (await import('dotenv')).config({ path: path.join(ROOT_PATH, '.env') });
    } finally {
        await main();
    }
})();

async function main() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.moncompteformation.gouv.fr/espace-prive/html/#/compte-utilisateur/connexion");

    await page.waitForSelector(SELECTORS.MCF_FRANCE_CONNECT_LOGIN);

    await Promise.all([
        page.waitForNavigation(),
        page.click(SELECTORS.MCF_FRANCE_CONNECT_LOGIN),
    ]);

    await Promise.all([
        page.waitForNavigation(),
        page.click(SELECTORS.FC_DGFIP),
    ]);

    const fiscalNumber = process.env.DGFIP_FISCAL_NUMBER!;
    const password = process.env.DGFIP_PASSWORD!;
    await page.type(SELECTORS.DGFIP_FISCAL_NUMBER_INPUT, fiscalNumber);

    await page.click(SELECTORS.DGFIP_LOGIN_BTN);
    await page.waitForSelector(SELECTORS.DGFIP_PASSWORD_INPUT, { visible: true });
    await page.click(SELECTORS.DGFIP_PASSWORD_INPUT);
    await page.type(SELECTORS.DGFIP_PASSWORD_INPUT, password);

    await Promise.all([
        page.waitForNavigation(),
        page.click(SELECTORS.DGFIP_LOGIN_BTN),
    ]);
    await page.click(SELECTORS.FC_CONTNUE_LOGIN);

    const cpfReq = await page.waitForResponse(request => request.url().includes("private/titulaire/me/droits/cpf"));

    const CPF: any = await cpfReq.json();

    console.log(CPF.compteurPrive.total);

    await page.close();
    process.exit();
}
