import {Message as OpenAIMessage, MessageCreateParams as OpenAIMessageCreateParams} from "openai/src/resources/beta/threads/messages";
import getClient from "../getClient.js";
import RequestOptions from "./RequestOptions.js";

export interface Message extends OpenAIMessage {}
export interface MessageCreateParams extends OpenAIMessageCreateParams {}

export async function createMessage(threadId: string, body: MessageCreateParams, options?: RequestOptions): Promise<Message> {
    let openai = getClient();

    return openai.beta.threads.messages.create(
        threadId,
        body,
        options
    );
}
