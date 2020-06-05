import React from "react";
import PropTypes from "prop-types";
import { epochMsToString } from "../utils/formatUtils";
import { getFileUrl, getFormattedFileSize, getFileDownloadUrl, getFileThumbnailUrl, getFilePreviewUrl } from "mattermost-redux/utils/file_utils";
import {Client4} from 'mattermost-redux/client';
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { Button, ButtonToolbar } from "react-bootstrap";
import {browserHistory} from 'mattermost-redux/utils/post_utils';
import PreviewModal from "./PreviewModal";

export default class ListRow extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            showConfirmationModal: false,
            showPreviewModal: false,
            link: null
        };

        this.onGetPublicLink = this.onGetPublicLink.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onDeleteConfirmed = this.onDeleteConfirmed.bind(this);
        this.onDeleteCancelled = this.onDeleteCancelled.bind(this);
        this.copyToClipboard = this.copyToClipboard.bind(this);
        this.onJumpToPost = this.onJumpToPost.bind(this);
        this.onShowPreview = this.onShowPreview.bind(this);
        this.onHidePreview = this.onHidePreview.bind(this);
    }

    copyToClipboard(inputRef) {
        if(this.state.link) {
            inputRef.select();
            document.execCommand('copy');
            this.setState({ link: null });
        }
    }

    async onGetPublicLink(e) {
        e.preventDefault();

        try {
            const response = await Client4.getFilePublicLink(this.props.file.ID);
            this.setState({ link: response.link });
            this.props.pushNotificationAlert("Public link has been copied to clipboard.");
        } catch(ex) {
            if(ex.statusCode == 501 && ex.id === "api.file.get_public_link.disabled.app_error")
                this.props.pushNotificationAlert("Public links have been disabled by the administrator");
            else
                throw ex;
        }
    }

    onJumpToPost() {
        //that's how it's implemented in
        //https://github.com/mattermost/mattermost-webapp/blob/master/components/search_results_item/search_results_item.jsx#L175
        window.location.assign(`${Client4.getUrl()}/${this.props.currentTeamName}/pl/${this.props.file.PostID}`);
    }

    onDelete() {
        this.setState({ showConfirmationModal: true });
    }

    onDeleteConfirmed() {
        this.onDeleteCancelled();

        this.props.onDelete(this.props.file);
    }

    onDeleteCancelled() {
        this.setState({ showConfirmationModal: false });
    }

    onShowPreview() {
        this.setState({ showPreviewModal: true });
    }

    onHidePreview() {
        this.setState({ showPreviewModal: false });
    }

    render() {
        const f = this.props.file;

        return (
            <tr className="post">
                {
                    this.props.areThumbsEnabled &&
                    <td style={{width: "25%"}}>
                        {
                            f.HasPreviewImage &&
                            <img style={{cursor: "pointer"}} src={getFileThumbnailUrl(f.ID)} onClick={this.onShowPreview} />
                        }
                    </td>
                }
                <td><a href={getFileDownloadUrl(f.ID)}>{f.FileName}</a></td>
                {
                    this.props.isModalForTeam &&
                    <td>{f.ChannelName}</td>
                }
                <td>{f.CreateByName}</td>
                <td>{epochMsToString(f.CreateAt)}</td>
                <td>{getFormattedFileSize({size: f.Size})}</td>
                <td style={{ width: 190, display: "wrap", flexWrap: "wrap" }}>
                    <ButtonToolbar>
                        <Button style={{margin: 2}} bsStyle="primary" bsSize="small" onClick={this.onJumpToPost} title="Jump to post">
                            <span>Jump</span>
                        </Button>
                        {
                            this.props.arePreviewsEnabled &&
                            f.HasPreviewImage &&
                            <Button style={{margin: 2}} bsStyle="primary" bsSize="small" onClick={this.onShowPreview} title="Preview">
                                <i className="fa fa-search" style={{ marginRight: 0 }} />
                            </Button>
                        }
                        {
                            this.props.arePublicLinksEnabled &&
                            <Button style={{margin: 2}} bsStyle="primary" bsSize="small" onClick={this.onGetPublicLink} title="Copy external link">
                                <i className="fa fa-external-link" style={{ marginRight: 0 }} />
                            </Button>
                        }
                        {
                            this.props.canDelete &&
                            <Button style={{margin: 2}} bsStyle="danger" bsSize="small" onClick={this.onDelete} title="Delete">
                                <i className="fa fa-times" style={{ marginRight: 0 }} />
                            </Button>
                        }
                    </ButtonToolbar>
                    {
                        this.state.showPreviewModal &&
                        <PreviewModal show={this.state.showPreviewModal} previewUrl={getFilePreviewUrl(f.ID)} onClose={this.onHidePreview} />
                    }
                    {
                        this.state.showConfirmationModal &&
                        <ConfirmDeleteModal file={f} onConfirm={this.onDeleteConfirmed} onCancel={this.onDeleteCancelled} />
                    }
                    { /* abysmal clipboard browser compatibility forces me to do this. The link will be copied from here */ }
                    {
                        this.state.link &&
                        <textarea ref={this.copyToClipboard} style={{ position: 'relative', left: "-9999px", readonly: "true"}} value={this.state.link} />
                    }
                </td>
            </tr>
        );
    }
}

ListRow.propTypes = {
    areThumbsEnabled: PropTypes.bool,
    arePreviewsEnabled: PropTypes.bool,
    currentTeamName: PropTypes.string,
    file: PropTypes.object,
    canDelete: PropTypes.bool,
    onDelete: PropTypes.func
}
