import {Actor} from 'apify';
import {PuppeteerCrawler, PlaywrightCrawler, CheerioCrawler, createBasicRouter} from 'crawlee';
const router = createBasicRouter();
import {findParser, fallbackParser} from "../parsers/index.js";
import parse from "../parse.js";

await Actor.init();
let input = Object.assign({
    links: [],
    useApifyProxy: true,
    aiAPIKey: null,
    callbackUrl: "",
}, (await Actor.getInput() ?? {}));
const proxyConfiguration = await Actor.createProxyConfiguration({useApifyProxy: input.useApifyProxy });
router.addDefaultHandler(async (context) => {
    // await scrollPageToBottom(data.page, {size: 1000, delay: 1000})
    let parseResult = await parse(context);

    let callbackUrl = input.callbackUrl;
    if(callbackUrl!= "") await doCallback(callbackUrl, parseResult);
    await context.pushData(parseResult);
});

const defaultCrawlerTag = fallbackParser.getCrawlerTag("");
let urlToCrawlerTags = input.links.map(link => {
    let url = link.url;
    let parser = findParser(url);
    let crawlerTag = defaultCrawlerTag;
    if(parser != null) crawlerTag = parser.getCrawlerTag(url);
    return {url, crawlerTag }
})
let crawlers = {};
urlToCrawlerTags.forEach(val => {
    let crawlerTag = val.crawlerTag;
    if(!crawlers.hasOwnProperty(crawlerTag)) crawlers[crawlerTag] = {
        instance: makeCrawler(crawlerTag),
        urls: new Set(),
    }
    crawlers[crawlerTag].urls.add(val.url);
})

let crawlerRunTasks = Object.keys(crawlers).map(crawlerTag => {
    let crawlerInstance = crawlers[crawlerTag].instance;
    let urls = Array.from(crawlers[crawlerTag].urls);
    return crawlerInstance.run(urls);
});
await Promise.allSettled(crawlerRunTasks);
await Actor.exit();

function makeCrawler(crawlerTag) {
    switch(crawlerTag) {
        case "puppeteer.browser":
            return new PuppeteerCrawler({
                proxyConfiguration,
                requestHandler: router,
                headless: false,
                ignoreIframes: true,
                requestHandlerTimeoutSecs: 40,
                sameDomainDelaySecs: 5,
                maxConcurrency: 1,
            });
        case "puppeteer.headless":
            return new PuppeteerCrawler({
                proxyConfiguration,
                requestHandler: router,
                headless: true,
                requestHandlerTimeoutSecs: 40,
                sameDomainDelaySecs: 5,
            });
        case "playwright.browser":
            return new PlaywrightCrawler({
                proxyConfiguration,
                requestHandler: router,
                headless: false,
                ignoreIframes: true,
                requestHandlerTimeoutSecs: 40,
                sameDomainDelaySecs: 5,
                maxConcurrency: 1,
            })
        case "playwright.headless":
            return new PlaywrightCrawler({
                proxyConfiguration,
                requestHandler: router,
                headless: true,
                requestHandlerTimeoutSecs: 40,
                sameDomainDelaySecs: 5,
            });
        case "cheerio":
        case "cheerio.browser":
        case "cheerio.headless":
            return new CheerioCrawler({
                proxyConfiguration,
                requestHandler: router,
                sameDomainDelaySecs: 2,
            });
        default:
            throw new Error(`Unsupported crawler tag: ${crawlerTag}`);
    }
}

async function doCallback(url, data) {
    // Send data to callback URL
    console.log(`Sending data to callback URL: ${url}`);
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })
}

// 'https://www.reuters.com/technology/us-propose-how-google-should-boost-online-search-competition-2024-10-08/',
// 'https://abcnews.go.com/Politics/harris-after-trumps-false-claims-femas-storm-response/story?id=114591158',
// "https://edition.cnn.com/2024/10/09/politics/democratic-anxiety-kamala-harris-2024-election/index.html",
