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
}

export type ClaudeTool = {
    name: string;
    description: string;
    input_schema: ToolParameters;
}