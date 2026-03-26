import type { WorkTask } from "./types";
import { taskTemplates, tenants } from "./data";
import type { RequestType, TemplateItem } from "./types";

export interface CreateTasksResult {
  requestType: RequestType;
  tenantSlug: string;
  employeeId?: string;
  startDate: string;
}

export const getTemplateByRequestType = (type: RequestType): TemplateItem | undefined =>
  taskTemplates.find((tpl) => tpl.requestType === type);

export const autoGenerateWorkTasks = ({ requestType, tenantSlug, employeeId, startDate }: CreateTasksResult): WorkTask[] => {
  const template = getTemplateByRequestType(requestType);
  const tenant = tenants.find((t) => t.slug === tenantSlug);
  if (!template || !tenant) return [];
  const start = new Date(startDate);

  return template.taskTemplates.map((task, idx) => {
    const due = new Date(start);
    due.setDate(start.getDate() + task.dueInDays);
    return {
      id: `auto-${tenant.id}-${requestType}-${Date.now()}-${idx}`,
      tenant_id: tenant.id,
      employee_id: employeeId,
      request_id: undefined,
      domain: task.domain,
      title: task.title,
      status: "todo",
      assignee_id: undefined,
      due_at: due.toISOString()
    };
  });
};
