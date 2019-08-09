import React from "react";
import './form.css';
import { run } from '../../parse.js';
import auth from "solid-auth-client";
import data from "@solid/query-ldflex";
import { fstat } from "fs";


var CUPurl;
const $rdf = require("rdflib");
const store = $rdf.graph();
const fs = require('fs');

var dataFromUserNT = "";


export default class Form extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedNtFle: 'CUP.nt'
        };
        CUPurl = this.props.webid;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.ingestData = this.ingestData.bind(this);
        this.populateForm = this.populateForm.bind(this);
    }

    componentDidMount() {
        var extentions = './Extentions';
        fs.readdir(extentions, (err, file) => {

            for(var i = 0; i<file.length;i++){
                console.log(file[i]);
            }
            this.setState({files:file})
        })

    }


    ingestData(template, data) {
        let ingestedData = '';
        let lines = template.split('\n');
        lines.forEach( (line) => {
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
        await fetch('./Extensions/' + this.state.selectedNtFle).then(
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
                else if ((dateID !==  "") && (data[i].includes(dateID)) && (data[i].includes("InformationBearingEntity"))){
                    IBE = data[i].split(">")[1].replace("_:cco_","");
                    console.log("IBE: " + IBE)
                }
                else if ((IBE !== "") && (data[i].includes(dateID)) && ((new RegExp('([0-9]*/[0-9]*/[0-9]*)+')).test(data[i]))){
                    birthDay = data[i].split(">")[1].replace("_:cco_","");
                    console.log(birthDay)
                } 
            }
            
            resolve(birthDay);
        })
    }

    pullOutDataFromNT = (data) =>{
        data = data.split("\n");
        var name;
        var birthDay;

        for (var i = 0;i < data.length;i++){
            if ((data[i].includes("GivenNameBearingEntity")) && (data[i].includes("has_text_value"))){
                name = data[i].split("has_text_value>")[1];
                name = name.substring(2,name.length-4);
                document.getElementById("firstName").value = name;
                this.setState({firstName:name})
            }
            else if ((data[i].includes("FamilyNameBearingEntity")) && (data[i].includes("has_text_value"))){
                name = data[i].split("has_text_value>")[1];
                name = name.substring(2,name.length-4);
                document.getElementById("lastName").value = name;
                this.setState({lastName:name})
            }
            else if ( (data[i].includes("\"") ) && (new RegExp('([0-9]*/[0-9]*/[0-9]*)+')).test(data[i]))  {
                birthDay = data[i].split("\"")[1]
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

    handlePullFromCard = async (webId)=>{
        var user = data[webId];
        
        var name = await user.name;
        name = name.toString();
        var firstName;
        var lastName;
        
        if (name.includes(" ")){
            var nameArr = name.split(" ");

            firstName = nameArr[0];
            lastName = nameArr[1];
            document.getElementById("firstName").value = firstName;
            document.getElementById("lastName").value = lastName;
            this.setState({firstName:firstName})
            this.setState({lastName:lastName})
        }
        else{
            document.getElementById("firstName").value = name;
        }
        
        const email = await user.vcard_hasEmail.vcard_value;        
        if (email !== undefined){
            document.getElementById("email").value = email;
            this.setState({email:email.toString()})
        }

        const city = await user.vcard_hasAddress.vcard_locality;
        if (city !== undefined){
            document.getElementById("city").value = city;
            this.setState({city:city.toString()})
        }

        const zipCode = await user.vcard_hasAddress["vcard:postal-code"];
        if (zipCode !== undefined){
            document.getElementById("zipcode").value = zipCode;
            this.setState({zipcode:zipCode.toString()})
        }

        const street = await user.vcard_hasAddress["vcard:street-address"];
        if (street !== undefined){
            document.getElementById("address").value = street;
            this.setState({address:street.toString()})
        }

        const state = await user.vcard_hasAddress.vcard_region;
        if (state !== undefined){
            document.getElementById("state").value = state;
            this.setState({state:state.toString()})
        }        
        
        var phone = await user.vcard_hasTelephone.vcard_value;
        if (phone !== undefined){
            phone = phone.toString().split(":")
            phone = phone[1]
            document.getElementById("phoneNumber").value = phone;
            this.setState({phoneNumber:phone})
        }

        console.log(this.state)
    }

    async populateForm() {
        // let res = await fetch('./Extensions/' + this.state.selectedNtFle);
        let res = await fetch('./CUP.nt');
        let text = await res.text();
        let arr = [];
        console.log(text);
        
    }


    render() {
        console.log(this.state);
        return (
            <div className ='mainDiv'>
                <div style={{display:'flex',flexDirection:'row'}}>
                <div style={{width:'50%'}}>
                    <div id="card-upload-area">
                        <b>Use data from your Card?</b>
                        <p>If you have already put your information into your Solid Card and would like to pull from that information, use this option.</p>
                            <input className ='pullButton' type='button' value="Pull" onClick={e=>{this.handlePullFromCard(this.props.webid)}}></input>
                        <br/><br/><br/>
                    </div>

                    <div id="fb-upload-area">
                        <b>Start with a .nt file?</b>

                        <form onSubmit={this.handleSubmitNt}>
                            <p>If you have a properly formatted .nt file from Facebook, upload it here with the file dialog.</p>
                            <label className = "fileContainer">
                            Upload
                                <input type="file" id="fileElem" accept=".nt" onChange={e => {this.handleFileChosen(e.target.files[0])}} ></input>                        
                            </label>
                            <br/><br/><br/>
                        </form>

                    </div>
                </div>
                <div style={{width:'50%'}}>
                    <div class="dropdown">
                        <button class="dropbtn">Add to Form</button>
                        <div class="dropdown-content">
                            <a href="#">Favorite Food</a>
                            <a href="#">Favorite Places to Shop</a>
                            <a href="#">add more...</a>
                        </div>
                    </div>
                </div>
                </div>
                <form onSubmit={this.handleSubmit}>
                    <br/><br/>
                    <b>Enter Data into the form.</b>
                    <br/><br/>
                    <div id='formStuff'>
                        {this.populateForm()}
                        {/* <label>First Name:<input id = "firstName" name="firstName" type='text' onChange={this.handleChange} /></label>
                        <label>Last Name:<input id = "lastName" name="lastName" type='text' onChange={this.handleChange} /></label>
                        <label>Address:<input id = "address" name='address' type='text' onChange={this.handleChange} /></label>
                        <label>City:<input id = "city" name='city' type='text' onChange={this.handleChange} /></label>
                        <label>State:<input id = "state" name='state' type='text' onChange={this.handleChange} /></label>
                        <label>County:<input id = "county" name="county" type='text' onChange={this.handleChange} /></label>
                        <label>Zipcode:<input id = "zipcode" name='zipcode' type='text' onChange={this.handleChange} /></label>
                        <label>Email Address:<input id = "email" name="email" type='text' onChange={this.handleChange} /></label>
                        <label>Phone Number:<input id = "phoneNumber" name="phoneNumber" type='text' onChange={this.handleChange} /></label>
                        <label>Date of Birth:<input id = "birthday" name="birthday" type='text' onChange={this.handleChange} /></label> */}
                    </div>
                
                    <br/><br/>

                    <div>
                        <input className ='submitButton' type='submit'></input>
                    </div>
                
                </form>

                <div>
                    <label id='error'></label>
                </div>

            </div>
        );
    }
}