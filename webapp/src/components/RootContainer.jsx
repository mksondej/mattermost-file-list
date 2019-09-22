import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    closeRootModal,
    getCurrentChannelFiles,
    deleteFile,
    clearErrors
} from '../actions';

import {
    isRootModalVisible,
    getLoadedFiles,
    getError
} from '../selectors';

import {
    pushNotificationAlert
} from "mattermost-redux/actions/alerts";

import {
    getCurrentUserId,
} from 'mattermost-redux/selectors/entities/common';

import {
    getCurrentChannel,
} from 'mattermost-redux/selectors/entities/channels';

import Root from './Root';

const empty = {};

const mapStateToProps = (state) => ({
    visible: isRootModalVisible(state),
    files: getLoadedFiles(state),
    currentRequest: (getLoadedFiles(state) || empty).Request,
    currentUserId: getCurrentUserId(state),
    currentChannelName: (getCurrentChannel(state) || empty).display_name,
    error: getError(state)
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    onClose: closeRootModal,
    onGetFiles: getCurrentChannelFiles,
    pushNotificationAlert,
    onDelete: deleteFile,
    onOpen: clearErrors
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Root);
