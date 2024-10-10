import _Parser from "./_Parser.js";
import {ContextData} from "../types/ContextData.js";
import ParseResult from "../types/ParseResult.js";

export default class ABCNews extends _Parser {
    public sampleUrls = articleUrls;
    public isAcceptedWebsite(url: string): boolean {
        return url.startsWith('https://abcnews.go.com/');
    }

    public async parse(context: ContextData): Promise<ParseResult> {
        let {request, page, enqueueLinks, log, pushData, parseWithCheerio} = context;

        const pageTitle = await page.title();
        const url = request.loadedUrl;

        let $ = await parseWithCheerio('[data-testid="prism-GridColumn"]');
        let articleTitle = $('[data-testid="prism-headline"]').children("h1").text();
        let paragraphs = $('[data-testid^="prism-article-body"]').children("p").map((index, element) => $(element).text()).get();

        let figures = $('[data-testid^="prism-figure"]').get();
        let images = figures.map((figure) => {
            return {
                url: $(figure).find("img").attr("src") ?? "",
            };
        })
        return { success: true, type: "article", pageTitle, url, articleTitle, paragraphs, images }
    }
}

const articleUrls = [
    'https://abcnews.go.com/Politics/harris-after-trumps-false-claims-femas-storm-response/story?id=114591158',
];
