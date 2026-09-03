import { sendOryCMSEmail } from "@/email";
import { renderOryCMSEmail } from "@/email/email.template";
import type { OryCMSProjectTaskRecord } from "./project-tasks.repo";

const PRIORITY_LABEL: Record<string, string> = {
  low: "Low priority",
  medium: "Medium priority",
  high: "High priority",
};

/**
 * Emails a task's assignee, mirroring exactly when the existing in-app
 * "task_assignment" notification fires (see the POST/PATCH task routes) —
 * same guard conditions (has an assignee, assignee isn't the actor, and on
 * PATCH only when the assignee actually changed), same "assigned" vs
 * "reassigned" wording. Best-effort: a delivery failure here must never
 * fail the task create/update request itself, matching how
 * orycms/auth/token-links.ts treats email as degradable.
 *
 * No-ops silently if the assignee has no email on file (shouldn't happen —
 * every OryCMS user has one — but fails closed rather than throwing).
 */
export async function sendOryCMSTaskAssignmentEmail({
  task,
  projectName,
  projectId,
  actorName,
  reassigned,
  origin,
}: {
  task: OryCMSProjectTaskRecord;
  projectName: string;
  projectId: string;
  actorName: string;
  reassigned: boolean;
  origin: string;
}): Promise<void> {
  if (!task.assigneeEmail) return;

  const verb = reassigned ? "reassigned" : "assigned";
  const link = `${origin.replace(/\/$/, "")}/admin/projectx/${projectId}`;

  const details: string[] = [];
  if (task.priority) details.push(PRIORITY_LABEL[task.priority] ?? task.priority);
  if (task.dueDate) {
    details.push(`Due ${new Date(task.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`);
  }

  try {
    await sendOryCMSEmail({
      to: task.assigneeEmail,
      subject: `You were ${verb}: ${task.title}`,
      text: `${actorName} ${verb} you the task "${task.title}" in ${projectName}.${
        details.length ? ` (${details.join(" · ")})` : ""
      }\n\nOpen it here: ${link}`,
      html: renderOryCMSEmail({
        heading: `You were ${verb} a task`,
        paragraphs: [
          `${actorName} ${verb} you the task "${task.title}" in the project ${projectName}.`,
          ...(task.description ? [task.description] : []),
        ],
        cta: { label: "Open task", url: link },
        footnote: details.length ? details.join(" · ") : undefined,
        securityNotice:
          "This notification was triggered by a teammate's action inside OryCMS. If you don't recognize this project or think this was sent by mistake, contact your workspace administrator.",
      }),
    });
  } catch {
    // Best-effort — task assignment must never fail because email delivery failed.
  }
}
