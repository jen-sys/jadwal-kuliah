import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { cardCls, jakartaDayInfo } from "@/lib/utils";
import TaskRow from "@/components/TaskRow";

export const dynamic = "force-dynamic";

const courseSelect = { select: { name: true, color: true } };

function Section({
  title,
  tone,
  children,
}: {
  title: string;
  tone?: "danger";
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className={`text-sm font-semibold mb-2 ${tone === "danger" ? "text-red-600" : "text-slate-700"}`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

const Empty = ({ text }: { text: string }) => (
  <div className={`${cardCls} px-4 py-6 text-center text-sm text-slate-400`}>{text}</div>
);

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const now = new Date();
  const { dayName, end } = jakartaDayInfo(now);
  const where = { userId: session.userId, done: false };

  const [courses, overdue, today, upcoming] = await Promise.all([
    prisma.course.findMany({
      where: { userId: session.userId, day: dayName },
      orderBy: { startTime: "asc" },
    }),
    // Deadline sudah lewat
    prisma.task.findMany({
      where: { ...where, deadline: { lt: now } },
      include: { course: courseSelect },
      orderBy: { deadline: "asc" },
    }),
    // Deadline hari ini yang belum lewat (yang sudah lewat tampil di "Deadline Lewat")
    prisma.task.findMany({
      where: { ...where, deadline: { gte: now, lt: end } },
      include: { course: courseSelect },
      orderBy: { deadline: "asc" },
    }),
    // 5 task berikutnya setelah hari ini
    prisma.task.findMany({
      where: { ...where, deadline: { gte: end } },
      include: { course: courseSelect },
      orderBy: { deadline: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Halo, {session.name} 👋</h1>

      <Section title={`Jadwal Hari Ini (${dayName})`}>
        {courses.length === 0 ? (
          <Empty text="Tidak ada kuliah hari ini 🎉" />
        ) : (
          <ul className={`${cardCls} divide-y divide-slate-100`}>
            {courses.map((c) => (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-1.5 self-stretch rounded-full" style={{ backgroundColor: c.color }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-xs text-slate-500">
                    {c.startTime}–{c.endTime}
                    {c.room ? ` • ${c.room}` : ""}
                    {c.lecturer ? ` • ${c.lecturer}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {overdue.length > 0 && (
        <Section title="Deadline Lewat" tone="danger">
          <ul className="bg-white rounded-xl border border-red-200 divide-y divide-red-100">
            {overdue.map((t) => (
              <TaskRow key={t.id} task={t} variant="overdue" />
            ))}
          </ul>
        </Section>
      )}

      <Section title="Deadline Hari Ini">
        {today.length === 0 ? (
          <Empty text="Tidak ada deadline hari ini 😌" />
        ) : (
          <ul className={`${cardCls} divide-y divide-slate-100 overflow-hidden`}>
            {today.map((t) => (
              <TaskRow key={t.id} task={t} variant="today" />
            ))}
          </ul>
        )}
      </Section>

      <Section title="Deadline Terdekat">
        {upcoming.length === 0 ? (
          <Empty text="Belum ada tugas mendatang 📭" />
        ) : (
          <ul className={`${cardCls} divide-y divide-slate-100`}>
            {upcoming.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
