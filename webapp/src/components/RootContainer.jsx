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
    getError,
    isModalForTeam
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
import { getCurrentTeam } from 'mattermost-redux/selectors/entities/teams';

const empty = {};

const mapStateToProps = (state) => ({
    visible: isRootModalVisible(state),
    files: getLoadedFiles(state),
    currentRequest: (getLoadedFiles(state) || empty).Request,
    currentUserId: getCurrentUserId(state),
    isModalForTeam: isModalForTeam(state),
    currentChannelName: (getCurrentChannel(state) || empty).display_name,
    currentTeamName: (getCurrentTeam(state) || empty).name,
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
