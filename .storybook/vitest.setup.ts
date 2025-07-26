import {beforeAll} from 'vitest';
import {setProjectAnnotations} from '@storybook/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as globalStorybookConfig from './preview';

// Ensure React is available globally
if (typeof window !== 'undefined') {
	window.React = React;
	window.ReactDOM = ReactDOM;
	// Force React to be the same instance
	globalThis.React = React;
	globalThis.ReactDOM = ReactDOM;
}

const annotations = setProjectAnnotations([globalStorybookConfig]);

beforeAll(annotations.beforeAll);
