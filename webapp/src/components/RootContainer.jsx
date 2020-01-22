import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    closeRootModal,
    getFiles,
    deleteFile,
    clearErrors,
    getExtensions
} from '../actions';

import {
    isRootModalVisible,
    getLoadedFiles,
    getError,
    isModalForTeam,
    extensions
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
import { getConfig } from 'mattermost-redux/selectors/entities/general';

const empty = {};

const mapStateToProps = (state) => ({
    visible: isRootModalVisible(state),
    files: getLoadedFiles(state),
    currentRequest: (getLoadedFiles(state) || empty).Request,
    currentUserId: getCurrentUserId(state),
    isModalForTeam: isModalForTeam(state),
    currentChannelName: (getCurrentChannel(state) || empty).display_name,
    currentTeamName: (getCurrentTeam(state) || empty).name,
    error: getError(state),
    arePublicLinksEnabled: getConfig(state).EnablePublicLink === 'true',
    extensions: extensions(state)
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    onClose: closeRootModal,
    onGetFiles: getFiles,
    pushNotificationAlert,
    onDelete: deleteFile,
    onOpen: clearErrors,
    onGetExtensions: getExtensions
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Root);
