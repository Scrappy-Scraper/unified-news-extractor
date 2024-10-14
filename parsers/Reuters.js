import _Parser from "./_Parser.js";
import {cleanBlankCharacters} from "../cleanBlankCharacters.ts";
import {simplifyElements} from "../simplifyElements.js";

export default class Reuters extends _Parser {
    sampleUrls = articleUrls;
    isAcceptedWebsite(url) {
        return url.startsWith('https://www.reuters.com/');
    }
    getCrawlerTag(url) { return "cheerio" }

    async parse(context) {
        let {request, page, enqueueLinks, log, pushData, parseWithCheerio} = context;

        const url = request.loadedUrl;

        let $ = await parseWithCheerio('[data-testid="Article"]');
        let pageTitle = $('title').get()[0]?.text ?? "";
        let articleTitle = $('h1[data-testid="Heading"]').text();
        let paragraphs = $('div[data-testid^="paragraph-"]').map((index, element) => $(element).text()).get();
        paragraphs = paragraphs.map(cleanBlankCharacters).filter(p => p!= "");

        let figures = $('[data-testid^="image-"]').get();
        let images = figures.map((figure) => {
            return {
                url: $(figure).find("img").attr("src") ?? "",
            };
        })

        let html = simplifyElements($).html();
        if(paragraphs.length == 0) return { success: false, url, errorCode: "parseFailed", errorMessage: "No paragraphs found", html, images};
        return { success: true, type: "article", pageTitle, url, articleTitle, paragraphs, images, html }
    }
}

const articleUrls = [
    'https://www.reuters.com/technology/us-propose-how-google-should-boost-online-search-competition-2024-10-08/',
];
