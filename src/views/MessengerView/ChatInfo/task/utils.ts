import type { TaskCardTask } from './types'

export function validateTask(task: Partial<TaskCardTask>) {
  return Boolean(task.text?.trim() && task.dueDate && task.assignees?.length)
}
