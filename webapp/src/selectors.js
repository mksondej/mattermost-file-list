import {id as pluginId} from './manifest';

const empty = {};
const getPluginState = (state) => state['plugins-' + pluginId] || empty;

export const isRootModalVisible = (state) => getPluginState(state).rootModalVisible;

export const getLoadedFiles = (state) => getPluginState(state).files;

export const getError = state => getPluginState(state).error;

export const isModalForTeam = state => getPluginState(state).isModalForTeam;
export const isTeamModalForAdmin = state => getPluginState(state).isTeamModalForAdmin;

export const getConfig = (state) => getPluginState(state).config;

export const extensions = (state) => getPluginState(state).extensions;
