// For more information, see https://crawlee.dev/
import { Actor } from 'apify';
import {PuppeteerCrawler, Request} from 'crawlee';
import { router } from './routes.js';
import {ProxyConfigurationOptions} from "apify/proxy_configuration.js";

await Actor.init();
interface Input {
    links: string[];
    useApifyProxy?: boolean;
    // apifyProxyGroup: string;
}
let input: Input = await Actor.getInput<Input>() ?? { links: ["https://example.com"], useApifyProxy: false  };
// const proxyConfiguration = await Actor.createProxyConfiguration({useApifyProxy});
console.log({input})
const crawler = new PuppeteerCrawler({
    // proxyConfiguration,
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
