import {Actor} from 'apify';
import {PuppeteerCrawler, PlaywrightCrawler, CheerioCrawler, createBasicRouter} from 'crawlee';
const router = createBasicRouter();
import {findParser, fallbackParser} from "../parsers/index.js";
import parse from "../parse.js";
import Chat from "../service/OpenAI/Chat.js";
import {setDefaultClient} from "../service/OpenAI/getClient.js";
import parseNewsArticleHTMLByOpenAI from "../helpers/parseNewsArticleHTMLByOpenAI.js";

await Actor.init();
let input = Object.assign({
    links: [],
    useApifyProxy: true,
    openAIAPIKey: null,
    openAIParse: true,
    callbackUrl: "",
}, (await Actor.getInput() ?? {}));
const proxyConfiguration = await Actor.createProxyConfiguration({useApifyProxy: input.useApifyProxy });
validateInputs(input);
router.addDefaultHandler(async (context) => {
    let parseResult = await parse(context);

    // further processing by OpenAI
    if((input.openAIAPIKey ?? "") != "") {
        try {
            parseResult = await processByOpenAI(input, parseResult);
        } catch(error) {} // if failed, do nothing
    }

    let callbackUrl = input.callbackUrl;
    await Promise.allSettled([
        (callbackUrl != "") ? doCallback(callbackUrl, parseResult) : new Promise(() => {}),
        context.pushData(parseResult)
    ])
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
                requestHandlerTimeoutSecs: 120,
                sameDomainDelaySecs: 5,
                maxConcurrency: 1,
            });
        case "puppeteer.headless":
            return new PuppeteerCrawler({
                proxyConfiguration,
                requestHandler: router,
                headless: true,
                requestHandlerTimeoutSecs: 120,
                sameDomainDelaySecs: 5,
            });
        case "playwright.browser":
            return new PlaywrightCrawler({
                proxyConfiguration,
                requestHandler: router,
                headless: false,
                ignoreIframes: true,
                requestHandlerTimeoutSecs: 120,
                sameDomainDelaySecs: 5,
                maxConcurrency: 1,
            })
        case "playwright.headless":
            return new PlaywrightCrawler({
                proxyConfiguration,
                requestHandler: router,
                headless: true,
                requestHandlerTimeoutSecs: 120,
                sameDomainDelaySecs: 5,
            });
        case "cheerio":
        case "cheerio.browser":
        case "cheerio.headless":
            return new CheerioCrawler({
                proxyConfiguration,
                requestHandler: router,
                sameDomainDelaySecs: 2,
                requestHandlerTimeoutSecs: 120,
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

async function processByOpenAI(input, parseResult) {
    let openAIAPIKey = input.openAIAPIKey ?? "";
    if(openAIAPIKey == "") return parseResult; // just return since no OpenAI API key provided
    setDefaultClient(openAIAPIKey);

    console.log("Using OpenAI to parse");
    // if needed, get OpenAI to parse
    if(
        ["noSupportedParser", "parseFailed"].includes(parseResult.errorCode) &&
        input.openAIParse == true
    ) {
        let chat = await Chat.create();
        let {isValidArticle, title, body, images} = await parseNewsArticleHTMLByOpenAI(parseResult.html, chat);
        if(isValidArticle) {
            parseResult = {
                success: true,
                type: "article",
                pageTitle: parseResult.pageTitle,
                url: parseResult.url,
                articleTitle: title,
                paragraphs: [body],
                images: images.length > 0? images : parseResult.images,
                html: parseResult.html,
            }
        }
    }

    return parseResult;
}

function validateInputs(input) {
}

// 'https://www.reuters.com/technology/us-propose-how-google-should-boost-online-search-competition-2024-10-08/',
// 'https://abcnews.go.com/Politics/harris-after-trumps-false-claims-femas-storm-response/story?id=114591158',
// "https://edition.cnn.com/2024/10/09/politics/democratic-anxiety-kamala-harris-2024-election/index.html",
