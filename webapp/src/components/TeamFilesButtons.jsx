import React from "react";
import {
    makeStyleFromTheme,
    changeOpacity
} from "mattermost-redux/utils/theme_utils";
import { connect } from "react-redux";
import { getConfig as getConfigSelector } from "../selectors";
import { openRootModal, getConfig as getConfigAction } from "../actions";

class TeamFilesButtons extends React.PureComponent {
    componentDidMount() {
        this.props.onGetConfig();
    }

    render() {
        const {
            theme,
            config,
            onOpenTeamFiles,
            onOpenAdminTeamFiles
        } = this.props;

        if (!config) return null;

        const style = getStyle(theme);

        return (
            <div style={style.containerHeader}>
                {
                    config.TeamFilesEnabled &&
                    <a
                        style={style.buttonHeader}
                        title="Team files"
                        onClick={onOpenTeamFiles}
                    >
                        <i className="fa fa-files-o" aria-hidden="true" />
                        <span style={style.buttonText}>All files</span>
                    </a>
                }
                {
                    config.AdminTeamFilesEnabled &&
                    <a
                        style={style.buttonHeader}
                        title="Team files (admin - all channels)"
                        onClick={onOpenAdminTeamFiles}
                    >
                        <i className="fa fa-files-o" aria-hidden="true" />
                        <span style={style.buttonText}>All files (admin)</span>
                    </a>
                }
            </div>
        );
    }
}

const getStyle = makeStyleFromTheme(theme => {
    return {
        buttonHeader: {
            color: changeOpacity(theme.sidebarText, 0.6),
            textAlign: "center",
            cursor: "pointer"
        },
        buttonText: {
            marginLeft: 5
        },
        containerHeader: {
            marginTop: "10px",
            marginBottom: "5px",
            display: "flex",
            alignItems: "flex-start",
            padding: "0 10px",
            flexDirection: "column"
        }
    };
});

export default connect(
    state => ({
        config: getConfigSelector(state)
    }),
    dispatch => ({
        onGetConfig: () => dispatch(getConfigAction()),
        onOpenTeamFiles: () => {
            dispatch(openRootModal(true, false));
        },
        onOpenAdminTeamFiles: () => {
            dispatch(openRootModal(true, true));
        }
    })
)(TeamFilesButtons);
