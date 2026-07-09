import type { AgentStreamEvent } from '../../../../../data'

export type TimelinePane = 'params' | 'response'

export type TimelineItem = {
  description?: string
  detail?: string
  eventName: string
  id: string
  label: string
  node: string
  paramsDetail?: string
  payload?: AgentStreamEvent['payload']
  responseDetail?: string
  selectedPane?: TimelinePane
  status: string
  tone?: string
  toolCallId?: string
  toolName?: string
  type: string
}
