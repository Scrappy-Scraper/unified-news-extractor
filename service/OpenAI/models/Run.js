import getClient from "../getClient.js";

export default async function createRun(threadId, body, options) {
    let openai = getClient();
    return await openai.beta.threads.runs.createAndPoll(
        threadId,
        body,
        options
    )
}
export async function getReplyFromRun(
    threadId,
    query,
    options
) {
    let openai = getClient();
    let messages = await openai.beta.threads.messages.list(
        threadId,
        query,
        options
    );
    return messages.data.find(msg => msg.role === "assistant" && msg.run_id == query.run_id) ?? null;
}
