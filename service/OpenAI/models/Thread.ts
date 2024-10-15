import {
    Thread as OpenAIThread,
    ThreadCreateParams as OpenAIThreadCreateParams
} from "openai/src/resources/beta/threads/threads";

import RequestOptions from "./RequestOptions.js";
import getClient from "../getClient.js";

export interface Thread extends OpenAIThread {}
export interface ThreadCreateParams extends OpenAIThreadCreateParams {}
export async function createThread(body?: ThreadCreateParams, options?: RequestOptions): Promise<Thread> {
    let openai = getClient();
    return openai.beta.threads.create(body, options);
}
