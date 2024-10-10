import ParseResult from "../types/ParseResult";
import {ContextData} from "../types/ContextData";

export default abstract class _Parser {
    public abstract isAcceptedWebsite(url: string): boolean;
    public abstract parse(data: ContextData): Promise<ParseResult>;
    public abstract sampleUrls: string[];
}
