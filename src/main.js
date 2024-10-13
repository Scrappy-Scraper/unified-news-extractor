// For more information, see https://crawlee.dev/
import {Actor} from 'apify';
import {PuppeteerCrawler} from 'crawlee';
import { router } from './routes.js';

await Actor.init();
let input = Object.assign({ links: [], useApifyProxy: true  }, (await Actor.getInput() ?? {}));
const proxyConfiguration = await Actor.createProxyConfiguration({useApifyProxy: input.useApifyProxy });

const crawler = new PuppeteerCrawler({
    proxyConfiguration,
    requestHandler: router,

    headless: false,
    maxConcurrency: 3,
    ignoreIframes: true,
    requestHandlerTimeoutSecs: 40,
    sameDomainDelaySecs: 5,
});

await crawler.run(input.links);

await Actor.exit();

// 'https://www.reuters.com/technology/us-propose-how-google-should-boost-online-search-competition-2024-10-08/',
// 'https://abcnews.go.com/Politics/harris-after-trumps-false-claims-femas-storm-response/story?id=114591158',
// "https://edition.cnn.com/2024/10/09/politics/democratic-anxiety-kamala-harris-2024-election/index.html",
