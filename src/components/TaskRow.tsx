import PriorityBadge from "./PriorityBadge";
import { formatDeadline } from "@/lib/utils";

type Props = {
  task: {
    title: string;
    deadline: Date | string;
    priority: string;
    course?: { name: string; color: string } | null;
  };
  variant?: "overdue" | "today" | "normal";
};

// Baris tugas read-only (dipakai di dashboard)
export default function TaskRow({ task, variant = "normal" }: Props) {
  return (
    <li
      className={`flex items-start justify-between gap-3 px-4 py-3 ${
        variant === "today" ? "bg-amber-50" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{task.title}</p>
        <p className={`text-xs mt-0.5 ${variant === "overdue" ? "text-red-600" : "text-slate-500"}`}>
          {formatDeadline(task.deadline)}
          {task.course ? (
            <span className="ml-2 inline-flex items-center gap-1 text-slate-500">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: task.course.color }} />
              {task.course.name}
            </span>
          ) : null}
        </p>
      </div>
      <PriorityBadge priority={task.priority} />
    </li>
  );
}
