type ToolParameters = {
    type: "object";
    properties: Record<string, ToolProperties>;
    required: string[];
}

type ToolProperties = {
    type: string;
    description: string;
    enum?: string[];
    items?: ToolProperties | ToolParameters;
    properties?: Record<string, ToolProperties>;
    required?: string[];
    default?: boolean;
}

export type ClaudeTool = {
    name: string;
    description: string;
    input_schema: ToolParameters;
}

export abstract class ClaudeToolType {
    protected readonly name: string;
    protected readonly description: string;
    protected readonly input_schema: ToolParameters;

    constructor(toolContext: ClaudeTool) {
        this.name = toolContext.name;
        this.description = toolContext.description;
        this.input_schema = toolContext.input_schema;
    }

    abstract execute(input: any): Promise<string>;

    getContext(): ClaudeTool {
        return {
            name: this.name,
            description: this.description,
            input_schema: this.input_schema
        };
    }
}