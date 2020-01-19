import {combineReducers} from 'redux';

import {OPEN_ROOT_MODAL, CLOSE_ROOT_MODAL, LOAD_FILES, SET_ERROR, SET_CONFIG} from './action_types';

const rootModalVisible = (state = false, action) => {
    switch (action.type) {
        case OPEN_ROOT_MODAL:
            return true;
        case CLOSE_ROOT_MODAL:
            return false;
        default:
            return state;
    }
};

const isModalForTeam = (state = false, action) => {
    switch(action.type) {
        case OPEN_ROOT_MODAL:
            return action.isModalForTeam || false;
        case CLOSE_ROOT_MODAL:
            return false;
        default:
            return state;
    }
}

const isTeamModalForAdmin = (state = false, action) => {
    switch(action.type) {
        case OPEN_ROOT_MODAL:
            return action.isTeamModalForAdmin || false;
        case CLOSE_ROOT_MODAL:
            return false;
        default:
            return state;
    }
}

const files = (state = null, action) => {
    switch(action.type) {
        case LOAD_FILES:
            return action.payload;
        default:
            return state;
    }
}

const error = (state = null, action) => {
    switch(action.type) {
        case SET_ERROR:
            return action.payload;
        default:
            return state;
    }
}

const config = (state = null, action) => {
    switch(action.type) {
        case SET_CONFIG:
            return action.payload;
        default:
            return state;
    }
}

export default combineReducers({
    rootModalVisible,
    isModalForTeam,
    isTeamModalForAdmin,
    files,
    error,
    config
});
