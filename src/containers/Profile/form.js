import React from "react";
// import DateTimePicker from 'react-datetime-picker';
// import DateTime from 'react-datetime';
import './form.css';
import { run } from '../../parse.js';
import auth from "solid-auth-client";
var CUPurl;
const $rdf = require("rdflib");
const store = $rdf.graph();

export default class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        CUPurl = this.props.webid.replace('profile/card#me', '') + 'private/cup#';

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        console.log("event is " + event.name);
        var name = event.target.name;
        var value = event.target.value;
        this.setState({
            [name]: value
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        event.stopPropagation();
        let fetcher = new $rdf.Fetcher(store);
        // create cup file if not already exists
        try {
            await fetcher.load(CUPurl);
            console.log('it works');
        }
        catch (error) {
            console.log(error);
            auth.fetch(CUPurl, {
                method: 'PUT', // or 'PUT'
                body: '' // data can be `string` or {object}!
            }).then(res => { return res; })
                .then((response) => { console.log('res is ' + response) })
                .catch(error => console.log(error));
        }
        document.getElementById('error').innerHTML = '';
        // Make sure that the user is filling out all the fields
        if (this.state.firstName == undefined) {
            let error = `Please enter a value for First Name`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.lastName == undefined) {
            let error = `Please enter a value for Last Name`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.address == undefined) {
            let error = `Please enter a value for Address`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.city == undefined) {
            let error = `Please enter a value for City`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.state == undefined) {
            let error = `Please enter a value for State`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.county == undefined) {
            let error = `Please enter a value for County`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.zipcode == undefined) {
            let error = `Please enter a value for Zipcode`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.email == undefined) {
            let error = `Please enter a value for Email Address`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.phoneNumber == undefined) {
            let error = `Please enter a value for Phone Number`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.birthday == undefined) {
            let error = `Please enter a value for Date of Birth`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        console.log('A name was submitted: ' + JSON.stringify(this.state));

        await run('../CUP.nt', CUPurl, this.state);
        // let x = await deleteStore().then(console.log(x));

    }


    render() {
        return (
            <div className='mainDiv'>
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <label>First Name:<input name="firstName" type='text' onChange={this.handleChange} /></label>
                        <label>Last Name:<input name="lastName" type='text' onChange={this.handleChange} /></label>
                        <label>Address:<input name='address' type='text' onChange={this.handleChange} /></label>
                        <label>City:<input name='city' type='text' onChange={this.handleChange} /></label>
                        <label>State:<input name='state' type='text' onChange={this.handleChange} /></label>
                        {/* <label>State: </label> <SelectUSState name='state' onChange={this.handleChange} /> */}
                        <label>County:<input name="county" type='text' onChange={this.handleChange} /></label>
                        <label>Zipcode:<input name='zipcode' type='text' onChange={this.handleChange} /></label>
                        <label>Email Address:<input name="email" type='text' onChange={this.handleChange} /></label>
                        <label>Phone Number:<input name="phoneNumber" type='text' onChange={this.handleChange} /></label>
                        <label>Date of Birth:<input name="birthday" type='text' onChange={this.handleChange} /></label>
                    </div>
                    <div>
                        <input className='submitButton' type='submit'></input>
                    </div>
                </form>
                <div>
                    <label id='error'></label>
                </div>
            </div>
        );
    }
}

