import React from "react";
import { Table, Modal, ProgressBar, Pagination, Row, Col, Alert } from "react-bootstrap";
import ListRow from "./ListRow";
import paginate from "../utils/pagination";
import Search from "./Search";
import SortIcon from "./SortIcon";

const empty = {};

export default class PreviewModal extends React.Component {
    render() {
        if (!this.props.show) {
            return null;
        }

        return (
            <Modal
                bsSize="lg"
                show={this.props.show}
                onHide={this.props.onClose}
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Preview
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={12}>
                            <img style={{width: "100%"}} src={this.props.previewUrl} />
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        );
    }
}


