export type Tool = {
  name: string
  description: string
  enabled: boolean
}

export type ListToolsResponse = {
  data: {
    tools: Tool[]
  }
  message: string
  success: boolean
}
