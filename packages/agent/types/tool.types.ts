
type InputSchema = {
    type: string;
    properties: {
        location: {
            type: "string";
            description: string;
        };
    };
    required: string[];
}

type Message = {
    role: "user" | "assistant";
    content: string;
}

export type Tool = {
    name: string;
    description: string;
    input_schema: InputSchema;
    messages: Message[];
}