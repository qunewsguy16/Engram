import { Shell } from "@/components/Shell";
import { Onboarding } from "@/components/Onboarding";
import { Today } from "@/components/widgets/Today";
import { Dream } from "@/components/widgets/Dream";
import { Memory } from "@/components/widgets/Memory";
import { Projects } from "@/components/widgets/Projects";
import { Learning } from "@/components/widgets/Learning";
import { TasksCalendar } from "@/components/widgets/TasksCalendar";
import { Inbox } from "@/components/widgets/Inbox";
import { ConnectorsFooter } from "@/components/ConnectorsFooter";

export default function Page() {
  return (
    <Shell>
      <Onboarding />
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
        </aside>
      </div>
      <ConnectorsFooter />
    </Shell>
  );
}
