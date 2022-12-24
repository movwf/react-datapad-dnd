import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import { PlusIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { MetricChart } from "@webclient/components/Dashboards/MetricChart";
import { useWindowSize } from "@webclient/context/WindowSizeContext";
import { useDashboardFetch } from "@core/hooks/data/use-dashboard-fetch";
import { TDashboardItemSizes } from "@webclient/config/Sizes";
import { DndContext, DragOverlay, pointerWithin } from "@dnd-kit/core";
import {
  addItem,
  initializeDndGrid,
  moveItem,
  removeItem,
  resizeItem,
} from "@webclient/lib/MetricGrid";

import Title from "@webclient/components/UI/Title/Title";
import Layout from "@webclient/components/Layout/Layout";
import Button from "@webclient/components/UI/Button/Button";
import Matrix from "@webclient/lib/Matrix";
import Droppable from "@webclient/components/DnD/Droppable/Droppable";
import Conditional from "@webclient/../core/src/react/conditional";
import AddMetricSidebar from "@webclient/components/Dashboards/AddMetricSidebar";

function DashboardMetrics(props) {
  const [isSidebarOpen, showSideBar] = props.sidebar;
  const [draggedItem, setDraggedItem] = useState({ id: "", metricData: {} });
  const [itemList, setItemList] = useState([]);
  const [matrix, setMatrix] = useState<Matrix>();

  useEffect(() => {
    const { orderedList, instance } = initializeDndGrid({
      itemList: props.metrics,
      windowSize: props.windowSize,
    });

    setItemList(orderedList);
    setMatrix(instance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.windowSize]);

  function customCollision(args) {
    const pointerCollisions = pointerWithin(args);

    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
  }

  const handleDragStart = (e: any) => {
    setDraggedItem({
      id: e.active.id,
      metricData: e.active.data.current,
    });
  };

  const handleDragOver = (e: any) => {
    const isNewMetric = e.active.id.includes("new");
    if (isNewMetric) console.log(e);

    if (e.over && !isNewMetric) {
      const [dropCol, dropRow] = e.over.data.current.dropScale
        .split("x")
        .map(Number);
      const [itemCol, itemRow] = e.active.data.current.itemScale
        .split("x")
        .map(Number);
      // [FACEPALM] Should have ref outside of dnd-kit
      const dragEl =
        e.activatorEvent.originalTarget.parentElement.parentElement
          .parentElement.parentElement.parentElement;
      dragEl.style.transition = `width 0.5s ease-in-out`;
      dragEl.style.height = `calc(${(dropRow / itemRow) * 100}%)`;
      dragEl.style.width = `calc(${(dropCol / itemCol) * 100}%)`;
    }
  };

  const handleDragEnd = (e: any) => {
    setDraggedItem({ id: "", metricData: {} });

    const isNewMetric = e.active.id.includes("new");
    if (isNewMetric && e.over) {
      const destinationId = Number(e.over.id.split("-")[1]);

      const updatedList = addItem({
        metricData: e.active.data.current,
        destinationId,
        dropScale: e.over.data.current.dropScale,
        instance: matrix,
        itemList,
      });

      setItemList(updatedList);
    }

    if (!isNewMetric) {
      const dragEl =
        e.activatorEvent.originalTarget.parentElement.parentElement
          .parentElement.parentElement.parentElement;
      dragEl.style.height = "100%";
      dragEl.style.width = "100%";
      if (e.over) {
        const sourceId = Number(e.active.id.split("-")[1]);
        const updatedList = moveItem({
          sourceId,
          destPos: e.over.data.current.pos,
          instance: matrix,
          itemList,
        });
        setItemList(updatedList);
      }
    }
  };

  const handleRemoveItem = (id: string | number) => {
    const updatedList = removeItem({
      itemId: Number(id),
      instance: matrix,
      itemList,
    });
    setItemList(updatedList);
  };

  const handleResizeItem = (
    id: string | number,
    nextSize: TDashboardItemSizes
  ) => {
    const updatedList = resizeItem({
      itemId: Number(id),
      nextSize,
      instance: matrix,
      itemList,
      windowSize: props.windowSize,
    });
    setItemList(updatedList);
  };

  return (
    <DndContext
      collisionDetection={customCollision}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-flow-row-dense grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        <button
          className="fixed top-6 right-6"
          onClick={() => {
            console.log(matrix.orderedList);
            console.log(itemList);
          }}
        >
          Click
        </button>
        {itemList.map((metric, idx) => (
          <Droppable
            key={`metric-${idx}`}
            id={idx}
            data={{ itemScale: metric.itemScale, pos: metric.pos }}
          >
            {metric.itemId ? (
              <MetricChart
                id={metric.itemId}
                metric={metric}
                remove={handleRemoveItem}
                resize={handleResizeItem}
              />
            ) : null}
          </Droppable>
        ))}
      </div>

      <Conditional if={isSidebarOpen}>
        <AddMetricSidebar
          close={() => showSideBar(false)}
          workspaceId={props.workspaceid}
        />
      </Conditional>

      <DragOverlay>
        {draggedItem ? (
          <MetricChart
            id={draggedItem.id}
            metric={draggedItem.metricData}
            value={draggedItem.id}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function DashboardInner(props) {
  const [isSidebarOpen, showSideBar] = useState(false);
  const { windowSize } = useWindowSize();
  const { dashboardid, workspaceid } = props;

  const { isError, error, isSuccess, status, data } = useDashboardFetch(
    workspaceid as string,
    dashboardid as string
  );

  if (isError) {
    return <>error: {JSON.stringify(error)}</>;
  }

  if (!isSuccess || data === undefined) {
    return <>status: {status}...</>;
  }

  return (
    <>
      <Title
        icon={data.icon}
        title={data.title}
        subtitle={data.description}
        buttonGroup={
          <>
            <Button
              title="Add New KPI"
              className="datapad-button-default h-10"
              loading={false}
              buttonImage={<PlusIcon className="h-6 w-6s" />}
              iconPosition="left"
              onClick={() => {
                showSideBar(true);
              }}
            />
          </>
        }
      />

      <DashboardMetrics
        metrics={data.metrics}
        windowSize={windowSize}
        workspaceid={workspaceid}
        sidebar={[isSidebarOpen, showSideBar]}
      />
    </>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const { workspaceid, dashboardid } = router.query;

  // sorry for this next.js
  if (workspaceid === undefined || dashboardid === undefined) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          Datapad - Workspace #{workspaceid} - Dashboard #${dashboardid}
        </title>
        <meta
          name="description"
          content={`Datapad - Workspace #${workspaceid} - Dashboard #${dashboardid}`}
        />
      </Head>

      <Layout title={`Workspace #${workspaceid} - Dashboard #${dashboardid}`}>
        <div className="mt-5">
          <DashboardInner workspaceid={workspaceid} dashboardid={dashboardid} />
        </div>

        <ul className="mt-5">
          <li>
            <Link href={`/${workspaceid}/dashboards/`}>
              <Button
                className="datapad-button"
                loading={false}
                title="Go Back"
              />
            </Link>
          </li>
        </ul>
      </Layout>
    </>
  );
}
