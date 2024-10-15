import {createThread} from "./models/Thread.js";
import {getDefaultAssistant} from "./models/Assistant.js";
import {createMessage} from "./models/Message.js";
import createRun, {getReplyFromRun} from "./models/Run.js";

export default class Chat {
    thread;
    assistant;
    requestOptions;

    static async create(body, requestOptions) {
        let thread = await createThread(body, requestOptions);
        let assistant = await getDefaultAssistant();

        return new Chat(thread, assistant, requestOptions);
    }

    async addUserMessage(message) {
        return await createMessage(
            this.thread.id,
            { role: "user", content: message },
            this.requestOptions
        )
    }
    async addAssistantMessage(message) {
        return await createMessage(
            this.thread.id,
            { role: "assistant", content: message },
            this.requestOptions
        )
    }

    setAssistantModel(model) {
        this.assistant.model = model;
        return this;
    }

    async submit(
        body,
    ) {
        let run = await createRun(
            this.thread.id,
            Object.assign({assistant_id: this.assistant.id}, body ?? {}),
            this.requestOptions
        );
        return await getReplyFromRun(this.thread.id, {run_id: run.id}, this.requestOptions);
    }

    constructor(thread, assistant, options) {
        this.thread = thread;
        this.assistant = assistant;
        this.requestOptions = options;
    }
    setAssistant(assistant){ this.assistant = assistant; return this; }
    setRequestOptions(options) { this.requestOptions = options; return this; }
}
