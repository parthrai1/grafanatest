import React, { useEffect, useMemo, useState } from 'react';

import { SelectableValue } from '@grafana/data';
import { EditorField, EditorRow } from '@grafana/experimental';
import { Select } from '@grafana/ui';

import { SELECT_WIDTH } from '../constants';
import CloudMonitoringDatasource from '../datasource';

export interface Props {
  refId: string;
  datasource: CloudMonitoringDatasource;
  onChange: (projectName: string) => void;
  templateVariableOptions: Array<SelectableValue<string>>;
  projectName: string;
}

export function Project({ refId, projectName, datasource, onChange, templateVariableOptions }: Props) {
  const [projects, setProjects] = useState<Array<SelectableValue<string>>>([]);
  useEffect(() => {
    datasource.getProjects().then((projects) => setProjects(projects));
  }, [datasource]);

  const projectsWithTemplateVariables = useMemo(
    () => [
      projects,
      {
        label: 'Template Variables',
        options: templateVariableOptions,
      },
      ...projects,
    ],
    [projects, templateVariableOptions]
  );

  return (
    <EditorRow>
      <EditorField label="Project">
        <Select
          width={SELECT_WIDTH}
          allowCustomValue
          formatCreateLabel={(v) => `Use project: ${v}`}
          onChange={({ value }) => onChange(value!)}
          options={projectsWithTemplateVariables}
          value={{ value: projectName, label: projectName }}
          placeholder="Select Project"
          inputId={`${refId}-project`}
        />
      </EditorField>
    </EditorRow>
  );
}
