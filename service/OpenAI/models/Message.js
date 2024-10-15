import getClient from "../getClient.js";

export async function createMessage(threadId, body, options) {
    let openai = getClient();

    return openai.beta.threads.messages.create(
        threadId,
        body,
        options
    );
}
