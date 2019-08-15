import React from "react";
import { Table, Modal, ProgressBar, Pagination, Row, Col } from "react-bootstrap";
import ListRow from "./ListRow";
import paginate from "../utils/pagination";
import Search from "./Search";

export default class Root extends React.Component {
    constructor(props) {
        super(props);

        this.goToPage = this.goToPage.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if(!this.props.visible && nextProps.visible) {
            nextProps.onGetFiles();
        }
    }

    goToPage(page, maxPage) {
        if(page < 1 || page > maxPage || page === this.props.files.Request.Page)
            return;

        const newRequest = {
            ...this.props.files.Request,
            Page: page
        };

        this.props.onGetFiles(newRequest);
    }

    renderPages() {
        if(!this.props.files) return null;

        const { Total, Request: { Page, PageSize } } = this.props.files;
        const maxPage=  Math.ceil(Total / PageSize);

        const pages = paginate(Page, maxPage);

        if(!pages || !pages.length) {
            return null;
        }

        return (
            <Pagination>
                <Pagination.First disabled={Page == 1} onClick={() => this.goToPage(1, maxPage)} />
                <Pagination.Prev disabled={Page == 1} onClick={() => this.goToPage(Page-1, maxPage)} />
                {
                    pages.map(p =>
                        p !== 0
                        ? <Pagination.Item onClick={() => this.goToPage(p, maxPage)} active={p === Page}>{p}</Pagination.Item>
                        : <Pagination.Ellipsis />
                    )
                }
                <Pagination.Next disabled={Page == maxPage} onClick={() => this.goToPage(Page+1, maxPage)} />
                <Pagination.Last disabled={Page == maxPage} onClick={() => this.goToPage(maxPage, maxPage)} />
            </Pagination>
        );
    }

    render() {
        if (!this.props.visible) {
            return null;
        }

        return (
            <Modal
                bsSize="lg"
                show={this.props.visible}
                onHide={this.props.onClose}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Files for channel "{this.props.currentChannelName}"</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <Col md={12}>
                            <Search />
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                        {
                            !this.props.files &&
                            <ProgressBar active now={100} label="Loading..." />
                        }
                        {
                            this.props.files &&
                            <Table striped hover>
                                <thead>
                                    <tr>
                                        <th>File</th>
                                        <th>Uploaded by</th>
                                        <th>Uploaded at</th>
                                        <th>Size</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.props.files
                                    && this.props.files.Items
                                    && this.props.files.Items.map(f =>
                                        <ListRow
                                            file={f}
                                            canDelete={f.CreateByID === this.props.currentUserId || this.props.files.CanCurrentUserDeleteAllFiles}
                                            pushNotificationAlert={this.props.pushNotificationAlert}
                                            onDelete={this.props.onDelete}
                                        />
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan={5} align="center">
                                            {this.renderPages()}
                                        </td>
                                    </tr>
                                </tfoot>
                            </Table>
                        }
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        );
    }
}


