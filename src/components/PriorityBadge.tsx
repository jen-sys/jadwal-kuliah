import { PRIORITY_CLASS, PRIORITY_LABEL } from "@/lib/utils";

export default function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
        PRIORITY_CLASS[priority] ?? PRIORITY_CLASS.LOW
      }`}
    >
      {PRIORITY_LABEL[priority] ?? priority}
    </span>
  );
}
