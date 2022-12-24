import React from "react";
import { useMetricsAllFetch } from "@core/hooks/data/use-metrics-all-fetch";

import Sidebar from "../Layout/Sidebar/Sidebar";
import MetricChart from "./MetricChart";

interface IProps {
  close: () => void;
  workspaceId: string;
}

const AddMetricSidebar: React.VFC<IProps> = ({ close, workspaceId }) => {
  const { isError, error, isSuccess, status, data } =
    useMetricsAllFetch(workspaceId);

  if (isError) {
    return <>error: {JSON.stringify(error)}</>;
  }

  if (!isSuccess || data === undefined) {
    return <>status: {status}...</>;
  }

  return (
    <Sidebar
      orientation="right"
      close={close}
      title="Add KPI to Dashboard"
      subtitle="← Drag any item to your dashboard"
    >
      {data.map((metric, idx) => (
        <MetricChart
          key={`new-${idx}`}
          id={`new-${idx + 1}`}
          metric={metric}
          className="border-2 border-gray-100 dark:rounded-xl rounded-sm shadow-sm my-2 max-h-[250px]"
        />
      ))}
    </Sidebar>
  );
};

export default AddMetricSidebar;
