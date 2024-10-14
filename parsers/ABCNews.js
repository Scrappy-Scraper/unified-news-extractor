import _Parser from "./_Parser.js";
import cleanBlankCharacters from "../cleanBlankCharacters.js";
import {simplifyElements} from "../simplifyElements.js";

export default class ABCNews extends _Parser {
    sampleUrls = articleUrls;
    isAcceptedWebsite(url) {
        return url.startsWith('https://abcnews.go.com/');
    }
    getCrawlerTag(url) { return "cheerio" }

    async parse(context) {
        let {request, page, enqueueLinks, log, pushData, parseWithCheerio} = context;

        const url = request.loadedUrl;

        let $ = await parseWithCheerio('[data-testid="prism-GridColumn"]');
        let pageTitle = $('title').get()[0]?.text ?? "";
        let articleTitle = $('[data-testid="prism-headline"]').children("h1").text();
        let paragraphs = $('[data-testid^="prism-article-body"]').children("p").map((index, element) => $(element).text()).get();
        paragraphs = paragraphs.map(cleanBlankCharacters).filter(p => p!= "");

        let figures = $('[data-testid^="prism-figure"]').get();
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
    'https://abcnews.go.com/Politics/harris-after-trumps-false-claims-femas-storm-response/story?id=114591158',
];
