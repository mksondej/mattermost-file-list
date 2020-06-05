import React, { Component } from "react";
import { Form, FormGroup, Col, FormControl, ControlLabel, Checkbox, Button } from "react-bootstrap";

export default class Search extends Component {
    constructor(props) {
        super(props);

        this.state = {
            query: "",
            queryInverted: false,
            extension: "",
            dirty: false,
            caseInsensitive: false
        };

        this.onQueryChange = this.onQueryChange.bind(this);
        this.onInvertChange = this.onInvertChange.bind(this);
        this.onCaseInsensitiveChange = this.onCaseInsensitiveChange.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.isValid = this.isValid.bind(this);
        this.onExtensionChange = this.onExtensionChange.bind(this);
    }

    componentDidMount() {
        this.props.onGetExtensions();
    }

    onQueryChange(e) {
        this.setState({ query: e.target.value, dirty: true });
    }

    onInvertChange(e) {
        this.setState({ queryInverted: e.target.checked, dirty: true });
    }

    onCaseInsensitiveChange(e) {
        this.setState({ caseInsensitive: e.target.checked });
    }

    onExtensionChange(e) {
        this.setState({ extension: e.target.value });
    }

    onSearch(e) {
        e.preventDefault();

        if(!this.isValid()) return;

        this.props.onSearch(this.state);
    }

    isValid() {
        //no validation needed for now
        return true;
    }

    render() {
        const isValid = this.isValid();

        return (
            <Form horizontal onSubmit={this.onSearch}>
                <FormGroup validationState={!isValid && this.state.dirty ? "error" : undefined}>
                    <Col componentClass={ControlLabel} sm={2}>
                        Name:
                    </Col>
                    <Col sm={8}>
                        <FormControl type="text" placeholder="Type file name" onChange={this.onQueryChange} value={this.state.query} />
                        <Checkbox onChange={this.onInvertChange} checked={this.state.queryInverted}>Invert?</Checkbox>
                        {
                            this.props.config && this.props.config.CaseInsensitiveEnabled &&
                            <Checkbox onChange={this.onCaseInsensitiveChange} checked={this.state.caseInsensitive}>Case insensitive</Checkbox>
                        }
                    </Col>
                    <Col sm={2}>
                        <Button bsStyle="primary" disabled={!isValid} onClick={this.onSearch}>Search</Button>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>
                        Extension:
                    </Col>
                    <Col sm={4}>
                        <FormControl componentClass="select" onChange={this.onExtensionChange} value={this.state.extension}>
                            <option value="">-All-</option>
                            {this.props.extensions && this.props.extensions.map(x => <option value={x}>{x}</option>)}
                        </FormControl>
                    </Col>
                </FormGroup>
            </Form>
        )
    }
}
