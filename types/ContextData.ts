import {LoadedContext} from "@crawlee/basic";
import {Dictionary, LoadedRequest, PuppeteerCrawlingContext} from "crawlee";

export type ContextData = LoadedContext<{
    request: LoadedRequest<PuppeteerCrawlingContext<Dictionary>["request"]>
} & Omit<PuppeteerCrawlingContext<Dictionary>, "request">>
