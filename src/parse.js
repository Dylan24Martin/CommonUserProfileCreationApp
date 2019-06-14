import { watchFile } from "fs";
//Define variables required for loading triples to Solid Pod 
const $rdf = require("rdflib");
const store = $rdf.graph();
var updater = new $rdf.UpdateManager(store);
var fetcher = new $rdf.Fetcher(store);
var me;
var profile;
//Holds the final sorted array
var orderedArray = [];
//Put your solid address here
var solidAddress = "https://jacobmcconomy.solid.community/profile/card#";

//specifies what the root node is of the .nt file being read 
//This is needed since the alogorithm requires knowing where to begin
var rootFileNode = "person";
var regExp1 = new RegExp(/_:\w\w\w_/);
var regExp2 = new RegExp(/:\w\w\w_/);
var matchRegExp = "";

async function fillOrderedArray(){
    orderedArray.length = 0;
    me = store.sym(solidAddress);
    profile = me.doc();
    await fetcher.load(profile);
    orderedArray = store.toString().split('\n');

    
    
}


export async function replaceTriple(oldTripleURL, newTripleURL){
    orderedArray.length = 0;
    
    
    var oldSplit = oldTripleURL.split(">");
    var newSplit = newTripleURL.split(">");
    
    console.log(oldSplit);
    console.log(newSplit);
    console.log(oldSplit[0].substring(1, oldSplit[0].length));
    me = store.sym(oldSplit[0].substring(1, oldSplit[0].length));
    profile = me.doc();
    await fetcher.load(profile);
    var oldPred = oldSplit[1].substring(2, oldSplit[1].length);
    var oldObj = oldSplit[2].substring(1, oldSplit[2].length - 2);

    var newPred = newSplit[1].substring(2, newSplit[1].length);
    var newObj = newSplit[2].substring(1, newSplit[2].length - 2);
    console.log("oldPred: " + oldPred);
    console.log("oldObj: " + oldObj);

    console.log("newPred: " + newPred);
    console.log("newObj: " + newObj);
    
    var currentstatements = store.match(me, store.sym(oldPred), oldObj, profile);
    
    store.add(me, store.sym(newPred), newObj, profile);

    var insertstatements = store.match(me, store.sym(newPred), newObj, profile);

    new Promise((accept, reject) => updater.update(currentstatements, insertstatements,
        (uri, ok, message) => {

            if (ok)

                accept();
            else

                reject(message);
        }));
   
    
}

export async function deleteTriples(){
    await fillOrderedArray();

    for(var i = 0; i < orderedArray.length; i++){
        var insertstatements = [];
        var tempArr = orderedArray[i].split(" ");
        fetcher.load(store.sym(tempArr[0].substring(1, tempArr[0].length - 1)));

        me = store.sym(tempArr[0].substring(1, tempArr[0].length - 1));
        
        profile = me.doc();

        var currentstatements = store.match(null, null, null, profile);

        new Promise((accept, reject) => updater.update(currentstatements, insertstatements,
            (uri, ok, message) => {

                if (ok)

                    accept();
                else

                    reject(message);
            }));


    }
    
}



function prependSolid(orderedArray) {

    for (var i = 0; i < orderedArray.length; i++) {
        //If it designating a child node
        //console.log(orderedArray[i]);
        var arrTest = orderedArray[i].split(" ");
        if (orderedArray[i].split("<").length == 2) {

            if (regExp1.test(arrTest[2])) {
                var tempArr = orderedArray[i].split(" ");
                //prepend to subject node
                tempArr[0] = tempArr[0].substring(6, tempArr[0].length);
                tempArr[0] = "<" + solidAddress + tempArr[0] + ">";
                //prepend to object node
                tempArr[2] = tempArr[2].substring(6, tempArr[2].length);
                tempArr[2] = "<" + solidAddress + tempArr[2] + ">";

                //upload to solid pod
                me = store.sym(tempArr[0].substring(1, tempArr[0].length - 1));
                profile = me.doc();

                var currentstatements = store.match(null, null, null, profile);
                store.add(me, store.sym(tempArr[1].substring(1, tempArr[1].length - 1)), store.sym(tempArr[2].substring(1, tempArr[2].length - 1)), profile);
                
                var insertstatements = store.match(null, null, null, profile);
                
                new Promise((accept, reject) => updater.update(currentstatements, insertstatements,
                    (uri, ok, message) => {

                        if (ok)

                            accept();
                        else

                            reject(message);
                    }));



                orderedArray[i] = tempArr.join(" ");


            }

            else {
                //prepend to subject node, leave object alone since it contains a value (like "DOE")

                var tempArr = orderedArray[i].split(" ");
                //Checks if the value has spaces and accounts for this

                if (tempArr.length > 4) {
                    var len = tempArr.length - 1;
                    for (var j = 3; j < len; j++) {
                        tempArr[2] = tempArr[2] + " " + tempArr[j];


                    }

                    tempArr[0] = tempArr[0].substring(6, tempArr[0].length);
                    tempArr[0] = "<" + solidAddress + tempArr[0] + ">";
                    tempArr[2] = tempArr[2].substring(1, tempArr[2].length - 1);
                   

                    //upload to solid pod
                    me = store.sym(tempArr[0].substring(1, tempArr[0].length - 1));
                    profile = me.doc();

                    var currentstatements = store.match(null, null, null, profile);
                    store.add(me, store.sym(tempArr[1].substring(1, tempArr[1].length - 1)), tempArr[2].substring(0, tempArr[2].length), profile);
                    var insertstatements = store.match(null, null, null, profile);
                    console.log(tempArr[1].substring(1, tempArr[1].length - 1));
                    console.log(tempArr[2].substring(0, tempArr[2].length));

                    new Promise((accept, reject) => updater.update(currentstatements, insertstatements,
                        (uri, ok, message) => {

                            if (ok)

                                accept();
                            else

                                reject(message);
                        }));


                    orderedArray[i] = tempArr[0] + " " + tempArr[1] + " " + tempArr[2];


                }
                else {

                    tempArr[0] = tempArr[0].substring(6, tempArr[0].length);
                    tempArr[0] = "<" + solidAddress + tempArr[0] + ">";
                    tempArr[2] = tempArr[2].substring(1, tempArr[2].length - 1);

                    //upload to solid pod
                    me = store.sym(tempArr[0].substring(1, tempArr[0].length - 1));
                    profile = me.doc();

                    var currentstatements = store.match(null, null, null, profile);
                    store.add(me, store.sym(tempArr[1].substring(1, tempArr[1].length - 1)), tempArr[2].substring(0, tempArr[2].length), profile);
                    var insertstatements = store.match(null, null, null, profile);
                    
                    new Promise((accept, reject) => updater.update(currentstatements, insertstatements,
                        (uri, ok, message) => {

                            if (ok)

                                accept();
                            else

                                reject(message);
                        }));


                    orderedArray[i] = tempArr.join(" ");

                }

            }


        }
        //Else it is a node definition
        else {
            var tempArr = orderedArray[i].split(" ");

            tempArr[0] = tempArr[0].substring(6, tempArr[0].length);


            //prepend to subject node
            tempArr[0] = "<" + solidAddress + tempArr[0] + ">";

            //upload to solid pod
            me = store.sym(tempArr[0].substring(1, tempArr[0].length - 1));
            profile = me.doc();

            var currentstatements = store.match(null, null, null, profile);
            store.add(me, store.sym(tempArr[1].substring(1, tempArr[1].length - 1)), store.sym(tempArr[2].substring(1, tempArr[2].length - 1)), profile);
            var insertstatements = store.match(null, null, null, profile);
            
            new Promise((accept, reject) => updater.update(currentstatements, insertstatements,
                (uri, ok, message) => {

                    if (ok)

                        accept();
                    else

                        reject(message);
                }));


            orderedArray[i] = tempArr.join(" ");


        }
    }
}


function parseBranches(branches, initialFile, parents) {

    var branchNum = branches.length;

    //Go through each branch and find children. if no children end, else recursively call function to keep going down the branch
    for (var i = 0; i < branchNum; i++) {

        var newBranches = [];
        var branchNode = branches[i].split(regExp2);
        //Array holds subject to be extracted and kept track of along the recursive function
        var previousBranches = [];
        var subject = branches[i].split(" ");
        if (!parents.includes(subject[0].substring(6, subject[0].length))) {
            parents.push(subject[0].substring(6, subject[0].length));

        }
        //parents.push(subject[0].substring(6,subject[0].length));


        if (branchNode.length == 3) {
            for (var j = 0; j < initialFile.length; j++) {
                //We must perform two splits to isolate the subject value so we can match our branches object with the
                //corresponding object
                var split1 = initialFile[j].split(regExp1);

                var split2 = split1[1].split(" ");


                if (split2[0].toLowerCase() == branchNode[2].toLowerCase().substring(0, branchNode[2].length - 2) && initialFile[j] != branches[i]) {
                    if (initialFile[j].split("<").length == 2 && initialFile[j].split(regExp1).length == 3) {
                        
                        //
                        // TODO: Remove IBE GUIDs 
                        //

                        var tempParentString = parents.join("/");
                        var insertParent = initialFile[j].split(regExp1);
                        matchRegExp = regExp1.exec(initialFile[j]);
                        var getChildString = insertParent[1].split(" ");

                        insertParent[1] = tempParentString + "/" + insertParent[1];
                        insertParent[2] = tempParentString + "/" + getChildString[0] + "/" + insertParent[2];
                        insertParent = insertParent.join(matchRegExp[0]);



                        //This is the node that defines its children are, this is tracked by newBranches
                        newBranches.push(initialFile[j]);

                        orderedArray.push(insertParent);







                    }
                    else if (initialFile[j].split("<").length == 2 && initialFile[j].split(regExp1).length == 2) {

                        //
                        // TODO: Remove IBE GUIDs 
                        //



                        var tempParentString = parents.join("/");

                        var insertParent = initialFile[j].split(regExp1);
                        matchRegExp = regExp1.exec(initialFile[j]);

                        insertParent[1] = tempParentString + "/" + insertParent[1];
                        insertParent = insertParent.join(matchRegExp[0]);




                        orderedArray.push(insertParent);

                    }
                    else {

                        //
                        // TODO: Remove IBE GUIDs 
                        //

                        var tempParentString = parents.join("/");

                        var insertParent = initialFile[j].split(regExp1);
                        matchRegExp = regExp1.exec(initialFile[j]);

                        insertParent[1] = tempParentString + "/" + insertParent[1];
                        insertParent = insertParent.join(matchRegExp[0]);


                        //This is the type identifier node, this can be immediately added to ordered array
                        orderedArray.push(insertParent);


                    }



                }

            }
        }
        //Base case for recursive function, it means the recursion has reached the end node of the branch
        if (newBranches.length == 0) {
            //END OF RECURSION, nothing else needed to do

        }

        else {
            //Else you haven't hit the end, keep going!
            parseBranches(newBranches.slice(), initialFile, parents.slice(0));


        }

    }




}



function parseNTFile(fileString, rootNode) {
    
    console.log("Parsing given .nt file...");

    //split file on new lines
    var fileArray = fileString.split(/\r?\n/);
    var fileLineNum = fileArray.length;


    var countRoot = 0;
    //Holds all triples that contain the root keyword (such as "person")
    var rootArray = [];
    //Holds the triple of the root node
    var rootTriple = [];
    //holds the branches that are to be created off the initial root node
    var rootBranches = [];




    console.log("Given file is " + fileArray.length + " lines long");
    //find and counts all root
    for (var i = 0; i < fileLineNum; i++) {
        if (fileArray[i].toLowerCase().includes(rootNode)) {
            countRoot++;
            rootArray.push(fileArray[i]);
        }
    }


    for (var i = 0; i < rootArray.length; i++) {
        var spaces = rootArray[i].split("<");

        //finds root triple based on the number of splits in the array of triples that contain the specified root node keword (such as "person")
        if (spaces.length == 3) {
            rootTriple = rootArray[i];

            orderedArray.push(rootTriple);


        }
        //Finds a branch off of the root node
        else {
            rootBranches.push(rootArray[i]);

        }
    }
    //added outside of initial for loop of rootArray to ensure the root is ordered first

    for (var i = 0; i < rootBranches.length; i++) {
        //We must prepend the subject to the object node, for instance 'person a propername' is transformed to 'person a person/propername'
        //This only needs to be done for the intial branches and we are still passing 'person a propername' into the recursive function since 
        //'person a person/propername' messes up the recursive function based on how I am doing it currently
        var temp = rootBranches[i].split(regExp1);
        matchRegExp = regExp1.exec(rootBranches[i]);
        // console.log(rootBranches[i]);
        // console.log(matchRegExp);
        var subject = temp[1].split(" ");
        temp[2] = subject[0] + "/" + temp[2];
        var tempRootBranches = temp.join(matchRegExp[0]);


        orderedArray.push(tempRootBranches);




    }

    //initate recursive function given the initial root node and its children
    parseBranches(rootBranches, fileArray, []);
    
    //Completed ordering, tracked by the array "orderedArray"
    console.log("Done...");
    console.log("The complete parsed .nt file is " + orderedArray.length + " lines long");

    //Prep for uploading to solid
    prependSolid(orderedArray);
    // for(var i = 0; i < orderedArray.length; i++){
    //     console.log(orderedArray[i]);
    // }
    
    

}

export async function run(file) {
    orderedArray.length = 0;
    await fetch(file)
        .then((r) => r.text())
        .then(text => {
            parseNTFile(text, rootFileNode);

        })


    return orderedArray;

}
