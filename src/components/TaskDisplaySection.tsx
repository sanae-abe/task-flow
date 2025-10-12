import { Heading } from "@primer/react";
import { memo } from "react";

interface TaskDisplaySectionProps {
  title: string;
  children: React.ReactNode;
  marginBottom?: string;
}

const TaskDisplaySection = memo<TaskDisplaySectionProps>(
  ({ title, children, marginBottom = "16px" }) => (
    <div style={{ marginBottom }}>
      <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: "700" }}>
        {title}
      </Heading>
      {children}
    </div>
  ),
);

TaskDisplaySection.displayName = "TaskDisplaySection";

export default TaskDisplaySection;
