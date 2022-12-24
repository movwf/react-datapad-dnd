import React from "react";
import { useDroppable } from "@dnd-kit/core";

interface IProps {
  id: number | string;
  children?: any;
  data?: Record<string, any>;
}

const Droppable: React.FC<IProps> = ({ id, children, data = {} }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `droppable-${id}`,
    data: {
      dropScale: data.itemScale || "1x1",
      pos: data.pos,
    },
  });
  const isSidebarOverlay = `${id}`.includes("sidebar-droppable");
  const style = !isSidebarOverlay
    ? isOver
      ? {
          border: "3px dashed purple",
        }
      : {
          border: "3px dashed lightgray",
        }
    : {};

  const [scaleCol, scaleRow] = (data.itemScale || "1x1").split("x").map(Number);
  return (
    <div
      ref={setNodeRef}
      className="relative h-full w-full"
      style={{
        gridColumn: `span ${scaleCol}`,
        gridRow: `span ${scaleRow}`,
      }}
    >
      <div
        className="absolute h-[95%] w-[95%] -z-10 m-[1%] rounded-xl"
        style={{
          ...style,
          transition: "border-color 0.5s",
          transitionTimingFunction: "cubic-bezier(0.1, 0.2, 0.5, 0.1)",
        }}
      />
      {children}
    </div>
  );
};

export default Droppable;
