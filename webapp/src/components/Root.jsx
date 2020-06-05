import React from "react";
import { Table, Modal, ProgressBar, Pagination, Row, Col, Alert } from "react-bootstrap";
import ListRow from "./ListRow";
import paginate from "../utils/pagination";
import Search from "./Search";
import SortIcon from "./SortIcon";

const empty = {};

export default class Root extends React.Component {
    constructor(props) {
        super(props);

        this.goToPage = this.goToPage.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.onToggleSort = this.onToggleSort.bind(this);

        this.renderErrorModalBody = this.renderErrorModalBody.bind(this);
        this.renderStandardModalBody = this.renderStandardModalBody.bind(this);
        this.renderColumnHeader = this.renderColumnHeader.bind(this);
    }

    componentDidMount() {
        if(this.props.visible) {
            this.props.onOpen();
            this.props.onGetFiles();

            if(!this.props.config)
                this.props.onGetConfig();
        }
    }

    componentDidUpdate(prevProps) {
        if(this.props.visible && !prevProps.visible) {
            this.props.onOpen();
            this.props.onGetFiles();

            if(!this.props.config)
                this.props.onGetConfig();
        }
    }

    goToPage(page, maxPage) {
        if(page < 1 || page > maxPage || page === this.props.currentRequest.Page)
            return;

        const newRequest = {
            ...this.props.currentRequest,
            Page: page
        };

        this.props.onGetFiles(newRequest);
    }

    onSearch(params) {
        const newRequest = {
            ...this.props.currentRequest,
            SearchQuery: params.query,
            SearchInverted: params.queryInverted,
            Extension: params.extension,
            IsCaseInsensitive: params.caseInsensitive
        };

        this.props.onGetFiles(newRequest);
    }

    onToggleSort(property) {
        const r = this.props.currentRequest;

        const newRequest = {
            ...r,
            OrderDirection: r.OrderBy != property
                ? r.OrderDirection
                : (r.OrderDirection ? 0 : 1), //flip
            OrderBy: property
        };

        this.props.onGetFiles(newRequest);
    }

    renderPages() {
        if(!this.props.files || !this.props.currentRequest) return null;

        const { Total, Request: { Page, PageSize } = empty } = this.props.files;
        const maxPage=  Math.ceil(Total / PageSize);

        const pages = paginate(Page, maxPage);

        if(!pages || !pages.length) {
            return null;
        }

        return (
            <Pagination bsClass="pagination file-list-pagination">
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

    renderStandardModalBody() {
        const theme = this.props.theme;

        return (
            <>
            <style type="text/css">
                {`
                    .file-list-pagination > li > a,
                    .file-list-pagination > li > span {
                        color: ${theme.buttonColor};
                        background-color: ${theme.buttonBg};
                    }
                    .file-list-table td {
                        word-break: break-word;
                    }
                `}
            </style>
                <Row>
                    <Col md={12}>
                        <Search
                            config={this.props.config}
                            onSearch={this.onSearch}
                            extensions={this.props.extensions}
                            onGetExtensions={this.props.onGetExtensions}
                        />
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
                        <Table hover bsClass="table file-list-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    {this.renderColumnHeader("FileName", "File")}
                                    {this.props.isModalForTeam && this.renderColumnHeader("ChannelName", "Channel")}
                                    {this.renderColumnHeader("CreateByName", "Uploaded by")}
                                    {this.renderColumnHeader("CreateAt", "Uploaded at")}
                                    {this.renderColumnHeader("Size", "Size")}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.props.files
                                && this.props.files.Items
                                && this.props.files.Items.map(f =>
                                    <ListRow
                                        arePreviewsEnabled
                                        areThumbsEnabled
                                        isModalForTeam={this.props.isModalForTeam}
                                        currentTeamName={this.props.currentTeamName}
                                        file={f}
                                        canDelete={f.CreateByID === this.props.currentUserId || this.props.files.CanCurrentUserDeleteAllFiles}
                                        pushNotificationAlert={this.props.pushNotificationAlert}
                                        arePublicLinksEnabled={this.props.arePublicLinksEnabled}
                                        onDelete={this.props.onDelete}
                                    />
                                )}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={6} align="center">
                                        {this.renderPages()}
                                    </td>
                                </tr>
                            </tfoot>
                        </Table>
                    }
                    </Col>
                </Row>
            </>
        );
    }

    renderColumnHeader(property, label) {
        const { OrderBy, OrderDirection } = this.props.currentRequest || empty;

        return (
            <th style={{cursor: "pointer"}} onClick={() => this.onToggleSort(property)}>
                {label} {OrderBy === property ? <SortIcon direction={OrderDirection} /> : null}
            </th>
        );
    }

    renderErrorModalBody() {
        return (
            <Row>
                <Col md={12}>
                    <Alert bsStyle="error">
                        {this.props.error}
                    </Alert>
                </Col>
            </Row>
        );
    }

    render() {
        if (!this.props.visible || !this.props.currentChannelName) {
            return null;
        }

        return (
            <Modal
                bsSize="xl"
                show={this.props.visible}
                onHide={this.props.onClose}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        {
                            this.props.isModalForTeam
                            ? <text>Files for team "{this.props.currentTeamName}"</text>
                            : <text>Files for channel "{this.props.currentChannelName}"</text>
                        }

                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {
                        this.props.error
                        ? this.renderErrorModalBody()
                        : this.renderStandardModalBody()
                    }
                </Modal.Body>
            </Modal>
        );
    }
}


