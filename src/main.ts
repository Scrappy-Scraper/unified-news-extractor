// For more information, see https://crawlee.dev/
import {PuppeteerCrawler, sleep, utils} from 'crawlee';
import parse from "../parse.js";
import {ContextData} from "../types/ContextData.js";
import { scrollPageToBottom } from 'puppeteer-autoscroll-down'

const crawler = new PuppeteerCrawler({
    async requestHandler(data: ContextData) {
        await scrollPageToBottom(data.page, {size: 1000, delay: 1000})
        let parseResult = await parse(data);

        // Save results as JSON to ./storage/datasets/default
        await data.pushData(parseResult);
    },

    headless: false,
    maxConcurrency: 3,
    ignoreIframes: true,
    requestHandlerTimeoutSecs: 40,
    sameDomainDelaySecs: 5,
});

await crawler.run([
    // 'https://www.reuters.com/technology/us-propose-how-google-should-boost-online-search-competition-2024-10-08/',
    // 'https://abcnews.go.com/Politics/harris-after-trumps-false-claims-femas-storm-response/story?id=114591158',
    "https://edition.cnn.com/2024/10/09/politics/democratic-anxiety-kamala-harris-2024-election/index.html",
]);
