import { Dataset, createPuppeteerRouter } from 'crawlee';
import {ContextData} from "../types/ContextData.js";
import { scrollPageToBottom } from 'puppeteer-autoscroll-down'
import parse from "../parse.js";

export const router = createPuppeteerRouter();

router.addDefaultHandler(async (data: ContextData) => {
    await scrollPageToBottom(data.page, {size: 1000, delay: 1000})
    let parseResult = await parse(data);

    // Save results as JSON to ./storage/datasets/default
    await data.pushData(parseResult);
});

router.addHandler('detail', async ({ request, page, log }) => {
    const title = await page.title();
    log.info(`${title}`, { url: request.loadedUrl });

    await Dataset.pushData({
        url: request.loadedUrl,
        title,
    });
});
