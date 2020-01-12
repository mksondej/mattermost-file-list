import React from 'react';
import {makeStyleFromTheme, changeOpacity} from 'mattermost-redux/utils/theme_utils';

function TeamFilesButton({theme}) {
    const style = getStyle(theme);

    return (
        <div style={style.containerHeader}>
            <a
                style={style.buttonHeader}
                title="Team files"
            >
                <i
                    className="fa fa-files-o"
                    aria-hidden='true'
                />
                <span style={style.buttonText}>All files</span>
            </a>
        </div>
    )
}

const getStyle = makeStyleFromTheme((theme) => {
    return {
        buttonHeader: {
            color: changeOpacity(theme.sidebarText, 0.6),
            textAlign: 'center',
            cursor: 'pointer',
        },
        buttonText: {
            marginLeft: 5,
        },
        containerHeader: {
            marginTop: '10px',
            marginBottom: '5px',
            display: 'flex',
            alignItems: 'flex-start',
            padding: '0 10px',
        }
    };
});

export default TeamFilesButton;
