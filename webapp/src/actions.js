
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {id as pluginId} from './manifest';

import {
    getCurrentChannelId,
} from 'mattermost-redux/selectors/entities/common';

import {
    OPEN_ROOT_MODAL, 
    CLOSE_ROOT_MODAL, 
    LOAD_FILES, 
    SET_ERROR
} from './action_types';
import { getLoadedFiles } from './selectors';
import { Client4 } from 'mattermost-redux/client';
import { buildQueryString } from "mattermost-redux/utils/helpers";

import request from 'superagent';

export const getPluginServerRoute = (state) => {
    const config = getConfig(state);

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

export const openRootModal = simpleAction(OPEN_ROOT_MODAL);
export const closeRootModal = simpleAction(CLOSE_ROOT_MODAL);

export const getCurrentChannelFiles = (pageRequest) => async (dispatch, getState) => {
    try {
        //ensure list reset
        dispatch({
            type: LOAD_FILES,
            payload: null
        });
    
        const state = getState();
        const baseUrl = getPluginServerRoute(state);
        const channelId = getCurrentChannelId(state);
    
        let url = baseUrl + "/files/channel/" + channelId;
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
    
        dispatch(getCurrentChannelFiles(currentFiles.Request));
    } catch {
        dispatch(notifyError());
    }
};

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