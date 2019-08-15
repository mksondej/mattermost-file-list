import React from "react";
import PropTypes from "prop-types";
import { epochMsToString } from "../utils/formatUtils";
import { getFileUrl, getFormattedFileSize, getFileDownloadUrl } from "mattermost-redux/utils/file_utils";
import {Client4} from 'mattermost-redux/client';
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { Button, ButtonToolbar } from "react-bootstrap";

const buttonStyle = {
    marginRight: "5px"
};

export default class ListRow extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            showConfirmationModal: false
        };

        this.onGetLink = this.onGetLink.bind(this);
        this.onGetPublicLink = this.onGetPublicLink.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onDeleteConfirmed = this.onDeleteConfirmed.bind(this);
        this.onDeleteCancelled = this.onDeleteCancelled.bind(this);
    }

    onGetLink() {
        navigator.clipboard.writeText(
            getFileUrl(this.props.file.ID)
        );

        this.props.pushNotificationAlert("Link has been copied to clipboard.");
    }

    async onGetPublicLink() {
        try {
            const response = await Client4.getFilePublicLink(this.props.file.ID);
            navigator.clipboard.writeText(response.json().link);
            this.props.pushNotificationAlert("Public link has been copied to clipboard.");
        } catch(ex) {
            if(ex.statusCode == 501 && ex.json().id === "api.file.get_public_link.disabled.app_error")
                this.props.pushNotificationAlert("Public links have been disabled by the administrator");
        }
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

    render() {
        const f = this.props.file;

        return (
            <tr>
                <td><a href={getFileDownloadUrl(f.ID)}>{f.FileName}</a></td>
                <td>{f.CreateByName}</td>
                <td>{epochMsToString(f.CreateAt)}</td>
                <td>{getFormattedFileSize({size: f.Size})}</td>
                <td>
                    <ButtonToolbar>
                        <Button bsSize="small" onClick={this.onGetLink} title="Copy link">
                            <i className="fa fa-link" style={{ marginRight: 0 }} />
                        </Button>
                        <Button bsSize="small" onClick={this.onGetPublicLink} title="Copy external link">
                            <i className="fa fa-external-link" style={{ marginRight: 0 }} />
                        </Button>
                        {
                            this.props.canDelete &&
                            <Button bsSize="small" onClick={this.onDelete} title="Delete">
                                <i className="fa fa-times" style={{ marginRight: 0 }} />
                            </Button>
                        }
                    </ButtonToolbar>
                    {
                        this.state.showConfirmationModal &&
                        <ConfirmDeleteModal file={f} onConfirm={this.onDeleteConfirmed} onCancel={this.onDeleteCancelled} />
                    }
                </td>
            </tr>
        );
    }
}

ListRow.propTypes = {
    file: PropTypes.object,
    canDelete: PropTypes.bool,
    onDelete: PropTypes.func
}
