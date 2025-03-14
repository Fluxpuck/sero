type Properties = {
    [key: string]: {
        type: string;
        description: string;
    }
}

type InputSchema = {
    type: string;
    properties: Properties;
    required?: string[];
}

export type Tool = {
    name: string;
    description: string;
    input_schema: InputSchema;
}
