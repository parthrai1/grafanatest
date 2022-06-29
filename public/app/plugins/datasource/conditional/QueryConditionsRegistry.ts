import { Registry } from '@grafana/data';

import { fieldValueClickCondition } from './conditions/fieldValueClickCondition';
import { timeRangeCondition } from './conditions/timeRangeCondition';
import { timeRangeIntervalCondition } from './conditions/timeRangeIntervalCondition';
import { QueryConditionInfo } from './types';

export const queryConditionsRegistry = new Registry<QueryConditionInfo>();

export const getQueryConditionItems = () => [fieldValueClickCondition, timeRangeCondition, timeRangeIntervalCondition];