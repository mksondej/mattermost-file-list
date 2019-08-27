import {id as pluginId} from './manifest';

const getPluginState = (state) => state['plugins-' + pluginId] || {};

export const isRootModalVisible = (state) => getPluginState(state).rootModalVisible;

export const getLoadedFiles = (state) => getPluginState(state).files;

export const getError = state => getPluginState(state).error;
