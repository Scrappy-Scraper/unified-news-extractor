import ParseResult from "../types/ParseResult.js";
import {ContextData} from "../types/ContextData.js";

export default abstract class _Parser {
    public abstract isAcceptedWebsite(url: string): boolean;
    public abstract parse(data: ContextData): Promise<ParseResult>;
    public abstract sampleUrls: string[];
    public getCrawlerTag(_: string) { return "cheerio" }
}

