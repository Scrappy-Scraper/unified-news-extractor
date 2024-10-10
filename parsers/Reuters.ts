import _Parser from "./_Parser.js";
import {ContextData} from "../types/ContextData.js";
import ParseResult from "../types/ParseResult.js";

export default class Reuters extends _Parser {
    public sampleUrls = articleUrls;
    public isAcceptedWebsite(url: string): boolean {
        return url.startsWith('https://www.reuters.com/');
    }

    public async parse(context: ContextData): Promise<ParseResult> {
        let {request, page, enqueueLinks, log, pushData, parseWithCheerio} = context;

        const pageTitle = await page.title();
        const url = request.loadedUrl;

        let $ = await parseWithCheerio('[data-testid="Article"]');
        let articleTitle = $('h1[data-testid="Heading"]').text();
        let paragraphs = $('div[data-testid^="paragraph-"]').map((index, element) => $(element).text()).get();

        let figures = $('[data-testid^="image-"]').get();
        let images = figures.map((figure) => {
            return {
                url: $(figure).find("img").attr("src") ?? "",
            };
        })
        return { success: true, type: "article", pageTitle, url, articleTitle, paragraphs, images }
    }
}

const articleUrls = [
    'https://www.reuters.com/technology/us-propose-how-google-should-boost-online-search-competition-2024-10-08/',
];
