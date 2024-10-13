import { Dataset, createPuppeteerRouter } from 'crawlee';
import { scrollPageToBottom } from 'puppeteer-autoscroll-down'
import parse from "../parse.js";

export const router = createPuppeteerRouter();

router.addDefaultHandler(async (data) => {
    await scrollPageToBottom(data.page, {size: 1000, delay: 1000})
    let parseResult = await parse(data);

    // Save results as JSON to ./storage/datasets/default
    await data.pushData(parseResult);
});
