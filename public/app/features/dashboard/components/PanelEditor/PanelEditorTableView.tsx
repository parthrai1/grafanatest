import { PanelChrome } from '@grafana/ui';
import { PanelRenderer } from 'app/features/panel/components/PanelRenderer';
import React, { useEffect, useState } from 'react';
import { DashboardModel, PanelModel } from '../../state';
import { usePanelLatestData } from './usePanelLatestData';
import { PanelOptions } from 'app/plugins/panel/table/models.gen';
import { RefreshEvent } from '@grafana/runtime';
import { applyPanelTimeOverrides } from 'app/features/dashboard/utils/panel';
import { getTimeSrv } from '../../services/TimeSrv';
import PanelHeaderCorner from '../../dashgrid/PanelHeader/PanelHeaderCorner';

interface Props {
  width: number;
  height: number;
  panel: PanelModel;
  dashboard: DashboardModel;
}

export function PanelEditorTableView({ width, height, panel, dashboard }: Props) {
  const { data } = usePanelLatestData(panel, { withTransforms: true, withFieldConfig: false }, false);
  const [options, setOptions] = useState<PanelOptions>({
    frameIndex: 0,
    showHeader: true,
    showTypeIcons: true,
  });

  // Subscribe to panel event
  useEffect(() => {
    const timeSrv = getTimeSrv();
    const timeData = applyPanelTimeOverrides(panel, timeSrv.timeRange());

    const sub = panel.events.subscribe(RefreshEvent, () => {
      panel.runAllPanelQueries(
        dashboard.id,
        dashboard.uid,
        dashboard.meta.isPublic,
        dashboard.getTimezone(),
        timeData,
        width
      );
    });
    return () => {
      sub.unsubscribe();
    };
  }, [panel, dashboard, width]);

  if (!data) {
    return null;
  }

  return (
    <PanelChrome width={width} height={height} padding="none">
      {(innerWidth, innerHeight) => (
        <>
          <PanelHeaderCorner panel={panel} error={data?.error?.message} />
          <PanelRenderer
            title="Raw data"
            pluginId="table"
            width={innerWidth}
            height={innerHeight}
            data={data}
            options={options}
            onOptionsChange={setOptions}
          />
        </>
      )}
    </PanelChrome>
  );
}
