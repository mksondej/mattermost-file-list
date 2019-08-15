import React from "react";
import { Modal, Button } from "react-bootstrap";

const ConfirmDeleteModal = ({ file, onConfirm, onCancel }) => (
    <Modal show close onHide={onCancel}>
        <Modal.Header>Are you sure?</Modal.Header>
        <Modal.Body>
            Are you sure you want to delete the file "{file.FileName}"?
            <p className="text-danger">Warning: this will delete the entire post with the file. If the post contains more files they will be deleted too.</p>
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={onConfirm}>Yes</Button>
            <Button onClick={onCancel} bsStyle="primary">
                No
            </Button>
        </Modal.Footer>
    </Modal>
);

export default ConfirmDeleteModal;
