import getClient from "../getClient.js";

export async function createThread(body, options) {
    let openai = getClient();
    return openai.beta.threads.create(body, options);
}
