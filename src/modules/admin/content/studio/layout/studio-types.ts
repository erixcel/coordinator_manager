import type { AgentStreamEvent } from '../../../../../data'

export type TimelineItem = {
  description?: string
  detail?: string
  eventName: string
  id: string
  label: string
  node: string
  payload?: AgentStreamEvent['payload']
  status: string
  tone?: string
  type: string
}
