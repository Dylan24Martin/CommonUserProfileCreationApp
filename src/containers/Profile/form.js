import React from "react";
import './form.css';
import { run } from '../../parse.js';
import auth from "solid-auth-client";

var CUPurl;
const $rdf = require("rdflib");
const store = $rdf.graph();
var dataFromUserNT = "";

export default class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
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
        if (document.getElementById("firstName").value === "") {
            let error = `Please enter a value for First Name`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (document.getElementById("lastName").value === "") {
            let error = `Please enter a value for Last Name`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.address === undefined) {
            let error = `Please enter a value for Address`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.city ===undefined) {
            let error = `Please enter a value for City`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.state === undefined) {
            let error = `Please enter a value for State`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.county === undefined) {
            let error = `Please enter a value for County`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.zipcode === undefined) {
            let error = `Please enter a value for Zipcode`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.email === undefined) {
            let error = `Please enter a value for Email Address`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.phoneNumber === undefined) {
            let error = `Please enter a value for Phone Number`;
            document.getElementById('error').innerHTML = error;
            return;
        }
        else if (this.state.birthday === undefined) {
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
                text += ("\n" + dataFromUserNT);
                console.log(text);
                run(text, 'person', CUPurl)
            }
        )
    }


    birthdayCheck = (data) => {
        return new Promise(resolve =>{
            for (var i = 0; i < data.length; i++){
                var dayEntity = "";
                var dateID = "";
                var IBE = "";
                var birthDay = "";

                if (data[i].includes("Birth") && data[i].includes("Day")) {
                    dayEntity = data[i].split(">")[1].replace("_:cco_","");
                    dayEntity = dayEntity.substring(1,dayEntity.length-3);
                    console.log("dateEntity: " + dayEntity)
                }
                else if ( (dayEntity !== "") && (data[i].includes(dayEntity))  && (data[i].includes("DateIdentifier"))){
                    dateID = data[i].split(">")[1].replace("_:cco_","").replace(" ","");
                    console.log("dateID: " + dateID)
                }
                else if ((dateID !== "") && (data[i].includes(dateID)) && (data[i].includes("InformationBearingEntity"))){
                    IBE = data[i].split(">")[1].replace("_:cco_","");
                    console.log("IBE: " + IBE)
                }
                else if ((IBE !== "") && (data[i].includes(dateID)) && ((new RegExp('([0-9]*\/[0-9]*\/[0-9]*)+')).test(data[i]))){
                    birthDay = data[i].split(">")[1].replace("_:cco_","");
                    console.log(birthDay)
                } 
            }
            
            resolve(birthDay);
        })
    }

    pullOutDataFromNT = (data) =>{
        data = data.split("\n");
        for (var i = 0;i < data.length;i++){
            if ((data[i].includes("GivenNameBearingEntity")) && (data[i].includes("has_text_value"))){
                var name = data[i].split("has_text_value>")[1];
                name = name.substring(2,name.length-4);
                document.getElementById("firstName").value = name;
                this.setState({firstName:name})
            }
            else if ((data[i].includes("FamilyNameBearingEntity")) && (data[i].includes("has_text_value"))){
                var name = data[i].split("has_text_value>")[1];
                name = name.substring(2,name.length-4);
                document.getElementById("lastName").value = name;
                this.setState({lastName:name})
            }
            else if ( (data[i].includes("\"") ) && (new RegExp('([0-9]*\/[0-9]*\/[0-9]*)+')).test(data[i]))  {
                var birthDay = data[i].split("\"")[1]
                document.getElementById("birthday").value = birthDay;
                this.setState({birthday:birthDay})
            }
        }
    }

    handleFileChosen = (file)=> {    
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e)=>{
            var data = reader.result;
            console.log(data)
            this.pullOutDataFromNT(data)
        }
    }

    render() {
       
        return (
            <div className='mainDiv'>

                <div id="upload-area">
                    <b>Start with a .nt file?</b>

                    <form onSubmit={this.handleSubmitNt}>
                        <p>If you have a properly formatted .nt file from Facebook, upload it here with the file dialog.</p>
                        <label class = "fileContainer">
                        Upload
                            <input type="file" id="fileElem" accept=".nt" onChange={e => {this.handleFileChosen(e.target.files[0])}} ></input>                        
                        </label>
                        <br/><br/><br/>
                    </form>

                </div>

                <form onSubmit={this.handleSubmit}>
                    <br/><br/>
                    <b>Enter Data into the form.</b>
                    <br/><br/>
                    <div>
                        <label>First Name:<input id = "firstName" name="firstName" type='text' onChange={this.handleChange} /></label>
                        <label>Last Name:<input id = "lastName" name="lastName" type='text' onChange={this.handleChange} /></label>
                        <label>Address:<input name='address' type='text' onChange={this.handleChange} /></label>
                        <label>City:<input name='city' type='text' onChange={this.handleChange} /></label>
                        <label>State:<input name='state' type='text' onChange={this.handleChange} /></label>
                        <label>County:<input name="county" type='text' onChange={this.handleChange} /></label>
                        <label>Zipcode:<input name='zipcode' type='text' onChange={this.handleChange} /></label>
                        <label>Email Address:<input name="email" type='text' onChange={this.handleChange} /></label>
                        <label>Phone Number:<input name="phoneNumber" type='text' onChange={this.handleChange} /></label>
                        <label>Date of Birth:<input id = "birthday" name="birthday" type='text' onChange={this.handleChange} /></label>
                    </div>
                
                    <br/><br/>

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