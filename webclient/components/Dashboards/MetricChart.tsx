import { useRef, useState } from "react";
import Link from "next/link";
import { CSS } from "@dnd-kit/utilities";
import { classNames } from "@core/react/class-names";
import { Conditional } from "@core/react/conditional";
import { useDraggable } from "@dnd-kit/core";
import { dateFormatter } from "@core/standards/date-formatter";
import {
  ArrowsExpandIcon,
  DotsHorizontalIcon,
  MenuIcon,
  XIcon,
} from "@heroicons/react/solid";

import Matrix from "@webclient/lib/Matrix";
import { MetricPieChart } from "./MetricPieChart";
import { MetricBarChart } from "./MetricBarChart";
import { MetricLineChart } from "./MetricLineChart";
import { MetricTableChart } from "./MetricTableChart";
import { MetricSingleValueChart } from "./MetricSingleValueChart";
import { removeItem } from "@webclient/lib/MetricGrid";
import { TDashboardItemSizes } from "@webclient/config/Sizes";

function GetParametersByChartType(chartType) {
  if (chartType === "BAR_CHART") {
    return {
      component: MetricBarChart,
      showGoal: true,
      showDate: false,
    };
  }

  if (chartType === "PIE_CHART") {
    return {
      component: MetricPieChart,
      showGoal: true,
      showDate: false,
    };
  }

  if (chartType === "LINE_CHART") {
    return {
      component: MetricLineChart,
      showGoal: true,
      showDate: false,
    };
  }

  if (chartType === "TABLE_CHART") {
    return {
      component: MetricTableChart,
      showGoal: false,
      showDate: false,
    };
  }

  if (chartType === undefined) {
    return {
      component: MetricSingleValueChart,
      showGoal: true,
      showDate: true,
    };
  }

  throw new Error(`invalid chart type: {chartType}`);
}

interface IProps {
  id: string | number;
  metric: any;
  className?: string;
  value?: string;
  remove?: (id: string | number) => void;
  resize?: (id: string | number, nextSize: TDashboardItemSizes) => void;
}

const MetricChart: React.FC<IProps> = ({
  id,
  metric,
  className,
  remove,
  resize,
}) => {
  const isNewMetric = `${id}`.includes("new");
  const [isMenuOpen, showMenu] = useState<boolean>(false);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `metric-${id}`,
    data: {
      ...metric,
      itemScale: isNewMetric ? "1x1" : metric.itemScale,
    },
    attributes: { role: "div" },
  });
  const params = GetParametersByChartType(metric.chart_type);

  const sizes: TDashboardItemSizes[] = ["small", "medium", "large"];
  const [size, setSize] = useState(metric.size);

  const style =
    transform && !isNewMetric
      ? {
          transform: CSS.Translate.toString(transform),
        }
      : {};

  const resizeClick = (e) => {
    const nextSize = sizes[(sizes.indexOf(size) + 1) % sizes.length];

    setSize(nextSize);
    resize(id, nextSize);

    e.preventDefault();
  };

  return (
    <div
      ref={setNodeRef}
      className={classNames([
        className,
        "flex flex-col h-full dark:bg-slate-800 bg-white rounded-lg p-4 group relative",
        size === "medium" && "col-span-2 row-span-1",
        size === "large" && "col-span-3 row-span-2",
        transform ? "shadow-2xl" : "shadow:sm",
      ])}
      onMouseLeave={() => {
        showMenu(false);
      }}
      // @ts-ignore
      style={style}
      {...attributes}
    >
      <div className="flex justify-between">
        <div>
          <div className="flex flex-row">
            <div
              className="h-4 w-4 text-slate-400 hidden group-hover:block cursor-grab"
              {...listeners}
            >
              <MenuIcon />
            </div>
            <Conditional if={params.showGoal}>
              <h3 className="ml-2 pb-2 text-lg">{metric.goal}</h3>
            </Conditional>
          </div>
          <h3
            className={classNames([
              "mt-2 grow-0 text-base",
              `text-{color.hardClass}`,
            ])}
          >
            {metric.icon} {metric.title}
          </h3>
          <Conditional if={params.showDate}>
            <h3 className="mt-2 text-base text-gray-400">
              {dateFormatter(metric.sys.updated_at ?? metric.sys.created_at)}
            </h3>
          </Conditional>
        </div>
        <Conditional if={!isNewMetric}>
          <div className="flex flex-row relative">
            <div className="flex flex-col hidden group-hover:block mr-2 cursor-pointer">
              <div
                className="h-4 w-4 text-slate-400"
                onClick={() => {
                  showMenu(true);
                }}
              >
                <DotsHorizontalIcon />
              </div>
              <Conditional if={isMenuOpen}>
                <div
                  className={classNames([
                    "absolute top-[12px] right-[18px] h-12 w-36",
                    "bg-white dark:bg-slate-600 dark:text-white hover:shadow-inner hover:border-2",
                    "flex flex-row justify-center items-center rounded-lg drop-shadow-lg",
                  ])}
                  onClick={() => {
                    showMenu(false);
                    remove(id);
                  }}
                >
                  <div className="h-6 w-6 text-red-500 flex justify-center items-center">
                    <XIcon />
                  </div>
                  Remove
                </div>
              </Conditional>
            </div>
            <div className="h-4 w-4 text-slate-400">
              <Link href=".">
                <a
                  onClick={(e) => resizeClick(e)}
                  className="hidden group-hover:block"
                >
                  <ArrowsExpandIcon />
                </a>
              </Link>
            </div>
          </div>
        </Conditional>
      </div>

      <div className="grow flex flex-col justify-center">
        <div>
          <params.component metric={metric} size={size} />
        </div>
      </div>
    </div>
  );
};

export { MetricChart, MetricChart as default };
