import React from "react";
import './form.css';
import { run } from '../../parse.js';
import auth from "solid-auth-client";
import data from "@solid/query-ldflex";


var CUPurl;
const $rdf = require("rdflib");
const store = $rdf.graph();
// api key for mapquest api
const apiKey = '0pm7SOWgNPPTG14tgjIZG1zG0lc3Aqu0';
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
        this.addressToCords = this.addressToCords.bind(this);
    }

    async componentDidMount() {
        let res = await fetch('./Extensions/extension.json');
        let files = await res.json();
        await this.setState({files:files.extensions});
        // <a onClick={() => this.populateForm()} href="#">Favorite Food</a>
        for (let x = 0; x < files.extensions.length; x++) {
            let item = document.createElement('a');
            item.onclick = () => {
                this.setState({
                    selectedNtFle: files.extensions[x]
                });
                this.populateForm();
            }
            item.innerHTML = files.extensions[x].replace('.nt','');
            document.getElementById('dropdown-content').appendChild(item);
        }
    }

    async addressToCords() {
        return new Promise(
          async (resolve, reject) => {
            let res = await fetch(`http://www.mapquestapi.com/geocoding/v1/address?key=${apiKey}&location=${this.state.addrVal.replace(/ /g, '+')},${this.state.cityVal},${this.state.stateVal}`);
            let json = await res.json();
            let lat = json.results[0].locations[0].latLng.lat;
            let lng = json.results[0].locations[0].latLng.lng;   
            resolve({ lat: lat, lng: lng });
          }
        )
    
      }

    async ingestData(template, data) {
        let ingestedData = '';
        let lines = template.split('\n');
        for( let c = 0; c < lines.length; c++){
            let line = lines[c];
            let value = line.split(' ')[2].replace(/"/g,"");
            let inputs = document.getElementsByClassName('input');
            for(let i = 0; i < inputs.length; i++){
                // handle lat and long
                if ((line.split(' ')[0].includes('LongitudeBearingEntity') || line.split(' ')[0].includes('LatitudeBearingEntity')) && line.split(' ')[2].startsWith('"')) {
                    console.log('here')
                    for (let x = 0; x < inputs.length; x++){
                        if(inputs[x].id.toLowerCase().includes('city')){
                            await this.setState({cityVal:inputs[x].value})
                        }
                        else if (inputs[x].id.toLowerCase().includes('state')){
                            await this.setState({stateVal:inputs[x].value})
                        }
                        else if (inputs[x].id.toLowerCase().includes('address')){
                            await this.setState({addrVal:inputs[x].value});
                        }
                    }
                    if(this.state.cityVal && this.state.stateVal && this.state.addrVal) {
                        console.log('here2')
                        let cords = await this.addressToCords();
                        if (line.split(" ")[0].includes('LongitudeBearingEntity')) {
                            console.log('here3')
                            line = line.replace(`${value}`,cords.lng)
                        }
                        else if(line.split(" ")[0].includes('LatitudeBearingEntity')) {
                            console.log('here4')
                            line = line.replace(`${value}`,cords.lat);
                        }
                    }
                }
                else if(inputs[i].id === value){
                    // handle if the input is supposed to be an object
                    if(line.split(' ')[1] === "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>"){
                        let tmp = inputs[i].value
                        let arr = tmp.split(' ');
                        tmp = '';
                        for(let x = 0; x < arr.length; x++) {
                            tmp += arr[x].substring(0,1).toUpperCase() + arr[x].substring(1,arr[x].length).toLowerCase();
                        }
                        line = line.replace(`"${value}"`, `<http://www.ontologyrepository.com/CommonCoreOntologies/${tmp}>`);
                    }
                    else {
                        line = line.replace(value, inputs[i].value);
                    }
                }
            }
            ingestedData += line + '\n';
        }
        console.log(ingestedData);
        return ingestedData;
    }

    handleChange(event) {
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
            auth.fetch(CUPurl, {
                method: 'PUT', // or 'PUT'
                body: '' // data can be `string` or {object}!
            }).then(res => { return res; })
            .catch(error => console.log(error));
        }
        document.getElementById('error').innerHTML = '';
        // make sure all fields in the form are filled out
        let inputs = document.getElementsByClassName('input');
        for (let x = 0;  x < inputs.length; x++) {
            if(inputs[x].value === '') {
                let str = '';
                for(let x = 0; x < inputs[x].id.split('_').length; x++){
                    str += inputs[x].id.split('_')[x] + ' ';
                }
                document.getElementById('error').innerHTML = `no value found in the ${str.substring(0,str.length-1)} input field. Please fill out all values.`;
            }
        }
        await fetch('./Extensions/' + this.state.selectedNtFle).then(
            r => r.text()
        ).then(
            text => this.ingestData(text, this.state)
        ).then(
            text => {
                text += ("\n" + dataFromUserNT);
                run(text, 'person', CUPurl)
            }
        )
    }

    birthdayCheck = (data) => {
        return new Promise(resolve => {
            for (var i = 0; i < data.length; i++) {
                var dayEntity = "";
                var dateID = "";
                var IBE = "";
                var birthDay = "";

                if (data[i].includes("Birth") && data[i].includes("Day")) {
                    dayEntity = data[i].split(">")[1].replace("_:cco_", "");
                    dayEntity = dayEntity.substring(1, dayEntity.length - 3);
                }
                else if ((dayEntity !== "") && (data[i].includes(dayEntity)) && (data[i].includes("DateIdentifier"))) {
                    dateID = data[i].split(">")[1].replace("_:cco_", "").replace(" ", "");
                }
                else if ((dateID !== "") && (data[i].includes(dateID)) && (data[i].includes("InformationBearingEntity"))) {
                    IBE = data[i].split(">")[1].replace("_:cco_", "");
                }
                else if ((IBE !== "") && (data[i].includes(dateID)) && ((new RegExp('([0-9]*/[0-9]*/[0-9]*)+')).test(data[i]))) {
                    birthDay = data[i].split(">")[1].replace("_:cco_", "");
                }
            }

            resolve(birthDay);
        })
    }

    pullOutDataFromNT = (data) => {
        data = data.split("\n");
        var name;
        var birthDay;

        for (var i = 0; i < data.length; i++) {
            if ((data[i].includes("GivenNameBearingEntity")) && (data[i].includes("has_text_value"))) {
                name = data[i].split("has_text_value>")[1];
                name = name.substring(2, name.length - 4);
                document.getElementById("firstName").value = name;
                this.setState({ firstName: name })
            }
            else if ((data[i].includes("FamilyNameBearingEntity")) && (data[i].includes("has_text_value"))) {
                name = data[i].split("has_text_value>")[1];
                name = name.substring(2, name.length - 4);
                document.getElementById("lastName").value = name;
                this.setState({ lastName: name })
            }
            else if ((data[i].includes("\"")) && (new RegExp('([0-9]*/[0-9]*/[0-9]*)+')).test(data[i])) {
                birthDay = data[i].split("\"")[1]
                document.getElementById("birthday").value = birthDay;
                this.setState({ birthday: birthDay })
            }
        }
    }

    handleFileChosen = (file) => {
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = (e) => {
            var data = reader.result;
            this.pullOutDataFromNT(data)
        }
    }

    handlePullFromCard = async (webId) => {
        var user = data[webId];

        var name = await user.name;
        name = name.toString();
        var firstName;
        var lastName;

        if (name.includes(" ")) {
            var nameArr = name.split(" ");

            firstName = nameArr[0];
            lastName = nameArr[1];
            document.getElementById("firstName").value = firstName;
            document.getElementById("lastName").value = lastName;
            this.setState({ firstName: firstName })
            this.setState({ lastName: lastName })
        }
        else {
            document.getElementById("firstName").value = name;
        }

        const email = await user.vcard_hasEmail.vcard_value;
        if (email !== undefined) {
            document.getElementById("email").value = email;
            this.setState({ email: email.toString() })
        }

        const city = await user.vcard_hasAddress.vcard_locality;
        if (city !== undefined) {
            document.getElementById("city").value = city;
            this.setState({ city: city.toString() })
        }

        const zipCode = await user.vcard_hasAddress["vcard:postal-code"];
        if (zipCode !== undefined) {
            document.getElementById("zipcode").value = zipCode;
            this.setState({ zipcode: zipCode.toString() })
        }

        const street = await user.vcard_hasAddress["vcard:street-address"];
        if (street !== undefined) {
            document.getElementById("address").value = street;
            this.setState({ address: street.toString() })
        }

        const state = await user.vcard_hasAddress.vcard_region;
        if (state !== undefined) {
            document.getElementById("state").value = state;
            this.setState({ state: state.toString() })
        }

        var phone = await user.vcard_hasTelephone.vcard_value;
        if (phone !== undefined) {
            phone = phone.toString().split(":")
            phone = phone[1]
            document.getElementById("phoneNumber").value = phone;
            this.setState({ phoneNumber: phone })
        }
    }

    async populateForm() {
        // let res = await fetch('./Extensions/' + this.state.selectedNtFle);
        let res = await fetch('./Extensions/' + this.state.selectedNtFle);
        let text = await res.text();
        document.getElementById('formStuff').innerHTML = (`
            <br /><br />
            <b>Enter Data into the form.</b>
            <br /><br />`
        );
        for (let i = 0; i < text.split('\n').length; i++) {
            let line = text.split('\n')[i];
            // determine if line is an input line
            if (line.split(' ')[0].includes('LongitudeBearingEntity') || line.split(' ')[0].includes('LatitudeBearingEntity')){
                continue;
            }
            else if (line.split(' ')[1].includes('/has_text_value') || line.split(' ')[2].startsWith('"')) {
                let value = line.split(' ')[2].replace(/"/g,'');
                // <label>First Name:<input id = "firstName" name="firstName" type='text' onChange={this.handleChange} /></label>
                let label = document.createElement('label');
                let input = document.createElement('input');
                input.id = value;
                input.className = 'input';
                input.type = 'text';
                input.onchange = this.handleChange;
                input.name = value;
                let str = '';
                for(let x = 0; x < value.split('_').length; x++){
                    str += value.split('_')[x] + ' ';
                }
                label.innerHTML = str.substring(0,str.length-1) + ':';
                label.appendChild(input);
                document.getElementById('formStuff').appendChild(label)
            }
        }
    }


    render() {
        return (
            <div className='mainDiv'>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div style={{ width: '50%' }}>
                        <div id="card-upload-area">
                            <b>Use data from your Card?</b>
                            <p>If you have already put your information into your Solid Card and would like to pull from that information, use this option.</p>
                            <input className='pullButton' type='button' value="Pull" onClick={e => { this.handlePullFromCard(this.props.webid) }}></input>
                            <br /><br /><br />
                        </div>

                        <div id="fb-upload-area">
                            <b>Start with a .nt file?</b>

                            <form onSubmit={this.handleSubmitNt}>
                                <p>If you have a properly formatted .nt file from Facebook, upload it here with the file dialog.</p>
                                <label className="fileContainer">
                                    Upload
                                <input type="file" id="fileElem" accept=".nt" onChange={e => { this.handleFileChosen(e.target.files[0]) }} ></input>
                                </label>
                                <br /><br /><br />
                            </form>

                        </div>
                    </div>
                    <div style={{ width: '50%' }}>
                        <div class="dropdown">
                            <button class="dropbtn">Form Select</button>
                            <div id='dropdown-content' class="dropdown-content">
                                {/* That dropdown context gets appended here */}
                            </div>
                        </div>
                    </div>
                </div>
                <form onSubmit={this.handleSubmit}>
                    
                    <div id='formStuff'>
                        {/* Add that form stuff here */}
                    </div>

                    <br /><br />

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