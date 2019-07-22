import React from "react";
import { run, deleteTriples, replaceTriple } from '/parse.js';
import { LogoutButton } from "@inrupt/solid-react-components";
import isLoading from "@hocs/isLoading";
import {
  WelcomeWrapper,
  WelcomeCard,
  WelcomeLogo,
  WelcomeProfile,
  WelcomeDetail,
  ImageContainer,
  ImageWrapper
} from "./welcome.style";
import { parseAsync, loadOptions } from "@babel/core";
// import ('./welcome.css')
const $rdf = require("rdflib");



const iterateProps = row => {
  var str = "";
  for (const k in row) {
    if (row.hasOwnProperty(k)) {
      if (str.length > 0) str += "; ";
      str += row[k];
    }
  }
  return str;
};

const getResults = results => {
  if (results) {
    return results.map(r => <p>{iterateProps(r)}</p>);
  } else {
    return "No results";
  }
};

// RG - 2019-04-09
// Modify a remote source by updating the local store
const updateStore = (rdf, updater, url, type, value, doc) => {

  // rdf == the store
  // updater == the rdflib update object for the store
  // url == the subject that will be updated; i.e., the url of the data, converted from string to the actual store object
  const urlObj = rdf.sym(url);
  // doc == the object that will be updated; i.e., the url where it will occur, converted from string to the actual store object
  const docUrl = rdf.sym(doc);
  // ins == the statements that will be inserted
  // urlObj == triple subj, type == triple pred, value == tripe obj, docUrl == location
  const ins = rdf.st(urlObj, type, value, docUrl);
  // del == the statements that will be deleted
  const del = [];
  updater.update(del, ins, (uri, ok, message) => {
    if (ok) console.log("Value updated: " + uri + ": " + value);
    else console.error(message);
  });
}

function replace() {
  replaceTriple("<https://jacobmcconomy.solid.community/profile/card#Person1/ProperName1/InformationBearingEntity1/GivenNameBearingEntityPart1_1cdcba5800c396b98ad4e86646eb0678d2cfdbbf_N88> <http://www.ontologyrepository.com/CommonCoreOntologies/has_text_value> JOHN .", "<https://jacobmcconomy.solid.community/profile/card#Person1/ProperName1/InformationBearingEntity1/GivenNameBearingEntityPart1_1cdcba5800c396b98ad4e86646eb0678d2cfdbbf_N88> <http://www.ontologyrepository.com/CommonCoreOntologies/has_text_value> JAKEISCOOL .");
}

const dataLoader = async () => {
  //Specify .nt file you would like to run the parsing function on
  await run("../john-doe-v5.nt");



}
function deleteAll() {
  deleteTriples()
}
/**
 * Welcome Page UI component, containing the styled components for the Welcome Page
 * Image component will get theimage context and resolve the value to render.
 * @param props
 */
const WelcomePageContent = props => {
  console.debug("Rendering");
  return (
    <WelcomeWrapper>
      <WelcomeCard className="card">
        <WelcomeProfile>
          <h1>
            Comon User Profile Creation
          </h1>
          <h3>
            Welcome, <span>{props.name}</span>
          </h3>
          {/* {<button onClick={() => updateStore(props.rdf, props.updater, props.updateUrl, props.updateType, props.updateValue, props.updateDoc)}>Test</button>}
          {<button onClick={() => dataLoader()}>Upload Triples</button>}
          {<button onClick={() => deleteAll()}>Delete Triples</button>}
          {<button onClick={() => replace()}>Replace Triple</button>} */}
          {/* <ImageWrapper>{props.image && <ImageContainer image={props.image} />}</ImageWrapper> */}
          {/* <p>
            All Done ? <LogoutButton />
          </p> */}
        </WelcomeProfile>
      </WelcomeCard>
      <WelcomeCard className="card">
        <WelcomeDetail>
          <div id='write' class='is-mac'>
            <h1>
              <a name='header-n26' class='md-header-anchor '></a>
              Common User Profile
            </h1>
            <p>
              The common user profile is a standardized user profile using linked data and the <a href='https://github.com/CommonCoreOntology/CommonCoreOntologies' target="_blank">common core ontology</a>. The purpose of the common user profile is to create a user owned profile that embodies attributes of the users everyday life and allow applications with the appropriate permissions to access that data, allowing user data to be shared by multiple apps.
            </p>
            <p>
              Contacts: Dylan Martin
              <br></br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              Jacob McConomy
              <br></br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              J Reynolds

            </p>
            <p>
              Email: <a href='mailto:dylan.martin@polarisalpha.com' target='_blank' class='url'>
                dylan.martin@polarisalpha.com, 
              </a>
              <br></br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <a href='mailto:jacob.w.mcconomy.civ@mail.mil' target='_blank' class='url'>
              jacob.w.mcconomy.civ@mail.mil
              </a>
              <br></br>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <a href='mailto:jason.reynolds@polarisalpha.com' target='_blank' class='url'>
                jason.reynolds@polarisalpha.com, 
              </a>
              <br></br>

            </p>
          </div>
        </WelcomeDetail>
      </WelcomeCard>
    </WelcomeWrapper>
  );
};

export default isLoading(WelcomePageContent);