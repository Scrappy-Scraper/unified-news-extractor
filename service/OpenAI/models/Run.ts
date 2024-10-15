import {
    Run as OpenAIRun,
    RunCreateParamsNonStreaming as OpenAIRunCreateParamsNonStreaming
} from "openai/src/resources/beta/threads/runs/runs";
import RequestOptions from "./RequestOptions.js";
import getClient from "../getClient.js";
import {Threads} from "openai/resources/beta/index";
import MessageListParams = Threads.MessageListParams;
import {Message} from "./Message.js";

export interface RunCreateParamsNonStreaming extends OpenAIRunCreateParamsNonStreaming {}
export interface Run extends OpenAIRun {}
export default async function createRun(threadId: string, body: RunCreateParamsNonStreaming, options?: RequestOptions): Promise<Run> {
    let openai = getClient();
    return await openai.beta.threads.runs.createAndPoll(
        threadId,
        body,
        options
    )
}
export async function getReplyFromRun(
    threadId: string,
    query: {run_id: string} & Omit<MessageListParams, "run_id">,
    options?: RequestOptions
): Promise<Message|null> {
    let openai = getClient();
    let messages = await openai.beta.threads.messages.list(
        threadId,
        query,
        options
    );
    return messages.data.find(msg => msg.role === "assistant" && msg.run_id == query.run_id) ?? null;
}
