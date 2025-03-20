type ToolParameters = {
    type: "object";
    properties: Record<string, ToolProperties>;
    required: string[];
}

type ToolProperties = {
    type: string;
    description: string;
    enum?: string[];
    items?: ToolProperties;
    properties?: Record<string, ToolProperties>;
}

export type ClaudeTool = {
    name: string;
    description: string;
    parameters: ToolParameters;
}