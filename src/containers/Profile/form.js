import React from "react";
// import DateTimePicker from 'react-datetime-picker';
// import DateTime from 'react-datetime';
import Select from 'react-select';
import './form.css';
import { run } from '../../parse.js';
import auth from "solid-auth-client";
// const tools = require('solid-rdflib-tools');
// const lib = new tools();
var CUPurl;
const $rdf = require("rdflib");
const store = $rdf.graph();

export default class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selOptions: [
                {value:'dab',label:'dab'},
                {value:'on',label:'on'},
                {value:'them',label:'them'}
            ]
        };
        // CUPurl = this.props.webid.replace('profile/card#me', '') + 'private/cup#';
        CUPurl = this.props.webid;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.ingestData = this.ingestData.bind(this);
    }

    ingestData(template, data) {
        let ingestedData = '';
        let lines = template.split('\n');
        lines.forEach( (line, index) => {
            let value = line.split(' ')[2];
            switch(value) {
                case '"last_name_value"':
                    line = line.replace('last_name_value', data.lastName);
                    ingestedData += line + '\n';
                    break;
                case '"first_name_value"':
                    line = line.replace('first_name_value', data.firstName);
                    ingestedData += line + '\n';
                    break;
                case '"county_value"':
                    line = line.replace('county_value', data.county);
                    ingestedData += line + '\n';
                    break;
                case '"email_value"':
                    line = line.replace('email_value', data.email);
                    ingestedData += line + '\n';
                    break;
                case '"phone_number_value"':
                    line = line.replace('phone_number_value', data.phoneNumber);
                    ingestedData += line + '\n';
                    break;
                case '"street_address_value"':
                    line = line.replace('street_address_value', data.address);
                    ingestedData += line + '\n';
                    break;
                case '"birthday_value"':
                    line = line.replace('birthday_value', data.birthday);
                    ingestedData += line + '\n';
                    break;
                case '"zip_code_value"':
                    line = line.replace('zip_code_value', data.zipcode);
                    ingestedData += line + '\n';
                    break;
                case '"city_value"':
                    line = line.replace('city_value', data.city);
                    ingestedData += line + '\n';
                    break;
                case '"state_value"':
                    line = line.replace('state_value', data.state);
                    ingestedData += line + '\n';
                    break;
                default:
                    ingestedData += line + '\n';
            }
        });
        return ingestedData;
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
        await fetch('./CUP.nt').then(
            r => r.text()
        ).then(
            text => this.ingestData(text,this.state)
        ).then(
            text =>  {
                console.log(text);
                run(text, 'person', CUPurl)
            }
        )
        // let x = await deleteStore().then(console.log(x));

    }


    render() {
        return (
            <div className='mainDiv'>
                <form onSubmit={this.handleSubmit}>
                    {/* <div className='extensionSelectDiv' >
                        <Select options={this.state.selOptions}/>
                    </div> */}
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

