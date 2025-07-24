import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/react';
import * as React from 'react';
import * as globalStorybookConfig from './preview';

if (typeof window !== 'undefined') {
  window.React = React;
}

const annotations = setProjectAnnotations([globalStorybookConfig]);

beforeAll(annotations.beforeAll);
