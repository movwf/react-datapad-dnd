import React, { ReactNode } from "react";
import { useDndContext } from "@dnd-kit/core";
import { XIcon } from "@heroicons/react/solid";
import { Portal } from "../Portal";
import Droppable from "@webclient/components/DnD/Droppable/Droppable";
import classNames from "@core/react/class-names";

interface ISidebar {
  children: ReactNode;
  orientation?: "left" | "right";
  close: () => void;
  title: string;
  subtitle?: string;
}

const Sidebar: React.FC<ISidebar> = ({
  children,
  orientation,
  close,
  title,
  subtitle,
}) => {
  const { active } = useDndContext();
  return (
    <Portal
      className="fixed h-full w-full z-[500] top-0"
      style={{
        ...(active
          ? { display: "none" }
          : { backgroundColor: "rgba(0,0,0,0.10)" }),
      }}
      onClick={(e) => {
        if (e.target === document.getElementById("portal-backdrop")) close();
      }}
    >
      <Droppable id="sidebar-droppable">
        <div
          className={classNames([
            `fixed h-full bg-white dark:bg-slate-800 top-0 z-[501] shadow-xl flex flex-col px-6 py-8`,
            `max-w-[350px] w-[350px]`,
            orientation === "left" && "left-0",
            orientation === "right" && "right-0",
            "animate-curtain",
          ])}
          style={
            active
              ? {
                  transition: "width 0.5s",
                  width: "125px",
                }
              : {
                  transition: "width 0.5s",
                }
          }
        >
          <div className="flex flex-row justify-between">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-[#29244A] dark:text-white">
                {title}
              </h2>
              <h3 className="text-[#797779] font-medium my-2 dark:text-white">
                {subtitle}
              </h3>
            </div>
            <div className="h-6 w-6 cursor-pointer" onClick={close}>
              <XIcon />
            </div>
          </div>
          <div
            className="mt-6 scrollable-area"
            style={active ? { width: "350px" } : {}}
          >
            {children}
          </div>
        </div>
      </Droppable>
    </Portal>
  );
};

export default Sidebar;
