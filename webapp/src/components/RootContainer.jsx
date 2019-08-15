import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {
    closeRootModal,
    getCurrentChannelFiles,
    deleteFile
} from '../actions';

import {
    isRootModalVisible,
    getLoadedFiles
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

const mapStateToProps = (state) => ({
    visible: isRootModalVisible(state),
    files: getLoadedFiles(state),
    currentUserId: getCurrentUserId(state),
    currentChannelName: getCurrentChannel(state).display_name
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
    onClose: closeRootModal,
    onGetFiles: getCurrentChannelFiles,
    pushNotificationAlert,
    onDelete: deleteFile
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Root);
