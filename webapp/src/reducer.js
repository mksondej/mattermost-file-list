import {combineReducers} from 'redux';

import {OPEN_ROOT_MODAL, CLOSE_ROOT_MODAL, LOAD_FILES, SET_ERROR, SET_CONFIG, LOAD_EXTENSIONS} from './action_types';

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

const getFromPayloadOfAction = (actionType) => (state = null, action) => {
    switch(action.type) {
        case actionType:
            return action.payload;
        default:
            return state;
    }
}

const files = getFromPayloadOfAction(LOAD_FILES);
const error = getFromPayloadOfAction(SET_ERROR);
const config = getFromPayloadOfAction(SET_CONFIG);
const extensions = getFromPayloadOfAction(LOAD_EXTENSIONS);

export default combineReducers({
    rootModalVisible,
    isModalForTeam,
    isTeamModalForAdmin,
    files,
    error,
    config,
    extensions
});
