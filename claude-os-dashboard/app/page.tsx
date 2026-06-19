import { Shell } from "@/components/Shell";
import { Today } from "@/components/widgets/Today";
import { Dream } from "@/components/widgets/Dream";
import { Memory } from "@/components/widgets/Memory";
import { Connectors } from "@/components/widgets/Connectors";
import { Projects } from "@/components/widgets/Projects";
import { Learning } from "@/components/widgets/Learning";
import { TasksCalendar } from "@/components/widgets/TasksCalendar";
import { Inbox } from "@/components/widgets/Inbox";

export default function Page() {
  return (
    <Shell>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <Today />
          <Dream />
          <TasksCalendar />
          <Projects />
        </div>
        <aside className="col-span-12 lg:col-span-4 space-y-4">
          <Inbox />
          <Memory />
          <Learning />
          <Connectors />
        </aside>
      </div>
    </Shell>
  );
}
