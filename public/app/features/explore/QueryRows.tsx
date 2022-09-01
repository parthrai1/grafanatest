import { createSelector } from '@reduxjs/toolkit';
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CoreApp, DataQuery, DataSourceInstanceSettings } from '@grafana/data';
import { getDataSourceSrv } from '@grafana/runtime';
import { getNextRefIdChar } from 'app/core/utils/query';
import { ExploreId } from 'app/types/explore';

import { getDatasourceSrv } from '../plugins/datasource_srv';
import { QueryEditorRows } from '../query/components/QueryEditorRows';

import { runQueries, changeQueriesAction, importQueries } from './state/query';
import { getExploreItemSelector } from './state/selectors';

interface Props {
  exploreId: ExploreId;
}

const makeSelectors = (exploreId: ExploreId) => {
  const exploreItemSelector = getExploreItemSelector(exploreId);
  return {
    getQueries: createSelector(exploreItemSelector, (s) => s!.queries),
    getQueryResponse: createSelector(exploreItemSelector, (s) => s!.queryResponse),
    getHistory: createSelector(exploreItemSelector, (s) => s!.history),
    getEventBridge: createSelector(exploreItemSelector, (s) => s!.eventBridge),
    getDatasourceInstanceSettings: createSelector(
      exploreItemSelector,
      (s) => getDatasourceSrv().getInstanceSettings(s!.datasourceInstance?.uid)!
    ),
  };
};

export const QueryRows = ({ exploreId }: Props) => {
  const dispatch = useDispatch();
  const { getQueries, getDatasourceInstanceSettings, getQueryResponse, getHistory, getEventBridge } = useMemo(
    () => makeSelectors(exploreId),
    [exploreId]
  );

  const queries = useSelector(getQueries)!;
  const dsSettings = useSelector(getDatasourceInstanceSettings)!;
  const queryResponse = useSelector(getQueryResponse)!;
  const history = useSelector(getHistory);
  const eventBridge = useSelector(getEventBridge);

  const trackActions = {
    duplicateQuery: 'grafana_explore_duplicate_query',
    disableEnableQuery: 'grafana_explore_disable_enable_query',
    remove: 'grafana_explore_remove_query_row',
  };

  const onRunQueries = useCallback(() => {
    dispatch(runQueries(exploreId));
  }, [dispatch, exploreId]);

  const onChange = useCallback(
    (newQueries: DataQuery[]) => {
      dispatch(changeQueriesAction({ queries: newQueries, exploreId }));

      // if we are removing a query we want to run the remaining ones
      if (newQueries.length < queries.length) {
        onRunQueries();
      }
    },
    [dispatch, exploreId, onRunQueries, queries]
  );

  const onAddQuery = useCallback(
    (query: DataQuery) => {
      onChange([...queries, { ...query, refId: getNextRefIdChar(queries) }]);
    },
    [onChange, queries]
  );

  const onMixedDataSourceChange = async (ds: DataSourceInstanceSettings, query: DataQuery) => {
    const queryDatasource = await getDataSourceSrv().get(query.datasource);
    const targetDS = await getDataSourceSrv().get({ uid: ds.uid });
    dispatch(importQueries(exploreId, queries, queryDatasource, targetDS, query.refId));
  };

  return (
    <QueryEditorRows
      dsSettings={dsSettings}
      onDatasourceChange={(ds: DataSourceInstanceSettings, query: DataQuery) => onMixedDataSourceChange(ds, query)}
      queries={queries}
      onQueriesChange={onChange}
      onAddQuery={onAddQuery}
      onRunQueries={onRunQueries}
      data={queryResponse}
      app={CoreApp.Explore}
      history={history}
      eventBus={eventBridge}
      trackActions={trackActions}
    />
  );
};
