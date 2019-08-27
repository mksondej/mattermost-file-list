import {combineReducers} from 'redux';

import {OPEN_ROOT_MODAL, CLOSE_ROOT_MODAL, LOAD_FILES, SET_ERROR} from './action_types';

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

export default combineReducers({
    rootModalVisible,
    files,
    error
});
