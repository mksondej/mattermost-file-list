
import {getConfig as getMattermostConfig} from 'mattermost-redux/selectors/entities/general';
import {id as pluginId} from './manifest';

import {
    getCurrentChannelId,
} from 'mattermost-redux/selectors/entities/common';

import {
    OPEN_ROOT_MODAL,
    CLOSE_ROOT_MODAL,
    LOAD_FILES,
    SET_ERROR,
    SET_CONFIG,
    LOAD_EXTENSIONS
} from './action_types';
import {
    getLoadedFiles,
    isModalForTeam,
    isTeamModalForAdmin
} from './selectors';
import { Client4 } from 'mattermost-redux/client';
import { buildQueryString } from "mattermost-redux/utils/helpers";

import request from 'superagent';
import { getCurrentTeamId } from 'mattermost-redux/selectors/entities/teams';

export const getPluginServerRoute = (state) => {
    const config = getMattermostConfig(state);

    let basePath = '/';
    if (config && config.SiteURL) {
        basePath = new URL(config.SiteURL).pathname;

        if (basePath && basePath[basePath.length - 1] === '/') {
            basePath = basePath.substr(0, basePath.length - 1);
        }
    }

    return basePath + '/plugins/' + pluginId;
};

const simpleAction = (type) => () => (dispatch) => {
    dispatch({ type });
};

export const openRootModal = (isModalForTeam, isTeamModalForAdmin) => dispatch => dispatch({ type: OPEN_ROOT_MODAL, isModalForTeam, isTeamModalForAdmin });
export const closeRootModal = simpleAction(CLOSE_ROOT_MODAL);

export const getConfig = () => async (dispatch, getState) => {
    const baseUrl = getPluginServerRoute(getState());

    const response = await request.
        get(baseUrl + "/config").
        set(Client4.getOptions({}).headers).
        accept('application/json');

    dispatch({
        type: SET_CONFIG,
        payload: response.body
    });
}

export const getFiles = (pageRequest) => async (dispatch, getState) => {
    try {
        //ensure list reset
        dispatch({
            type: LOAD_FILES,
            payload: null
        });

        const state = getState();
        const isTeamMode = isModalForTeam(state);
        const baseUrl = getPluginServerRoute(state);

        let url = baseUrl;
        if(!isTeamMode) {
            const channelId = getCurrentChannelId(state);
            url += "/files/channel/" + channelId;
        } else {
            const teamId = getCurrentTeamId(state);
            url += "/files/team/" + teamId;

            const shouldGetAll = isTeamModalForAdmin(state);
            if(shouldGetAll) {
                url += "/all";
            }
        }

        if(pageRequest)
            url += buildQueryString(pageRequest);

        const response = await request.
            get(url).
            set(Client4.getOptions({}).headers).
            accept('application/json');

        dispatch({
            type: LOAD_FILES,
            payload: response.body
        });
    } catch {
        dispatch(notifyError());
    }
};

export const deleteFile = (file) => async (dispatch, getState) => {
    try {
        await Client4.deletePost(file.PostID);

        const state = getState();
        const currentFiles = getLoadedFiles(state);

        dispatch(getFiles(currentFiles.Request));
    } catch {
        dispatch(notifyError());
    }
};

export const getExtensions = () => async (dispatch, getState) => {
    try {
        const state = getState();
        const baseUrl = getPluginServerRoute(state);
        const isTeamMode = isModalForTeam(state);

        let url = baseUrl;
        if(!isTeamMode) {
            const channelId = getCurrentChannelId(state);
            url += "/files/channel/" + channelId + "/extensions";
        } else {
            const teamId = getCurrentTeamId(state);
            url += "/files/team/" + teamId + "/extensions";
        }

        const response = await request.
            get(url).
            set(Client4.getOptions({}).headers).
            accept('application/json');

        dispatch({
            type: LOAD_EXTENSIONS,
            payload: response.body
        });
    } catch {
        dispatch(notifyError());
    }
}

export const clearErrors = () => setError(null);

function notifyError() {
    return setError("An error occured in the File List plugin. Please notify the administrator. A detailed error message was added to the server log.");
}

function setError(msg) {
    return {
        type: SET_ERROR,
        payload: msg
    };
}
