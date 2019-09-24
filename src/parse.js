//Define variables required for loading triples to Solid Pod 
const $rdf = require("rdflib");
var me;
var profile;
//Holds the final sorted array
var orderedArray = [];
var orderedStatements = [];
//Put your solid address here
var solidAddress;
//specifies what the root node is of the .nt file being read 
//This is needed since the alogorithm requires knowing where to begin
var rootFileNode;
var regExp1 = new RegExp(/_:\w\w\w_/);
var regExp2 = new RegExp(/:\w\w\w_/);
var matchRegExp = "";


export async function replaceTriple(oldTripleURL, newTripleURL) {
    orderedArray.length = 0;
    var store = $rdf.graph();
    var updater = new $rdf.UpdateManager(store);
    var fetcher = new $rdf.Fetcher(store);

    var oldSplit = oldTripleURL.split(">");
    var newSplit = newTripleURL.split(">");

    me = store.sym(oldSplit[0].substring(1, oldSplit[0].length));
    profile = me.doc();
    await fetcher.load(profile);
    var oldPred = oldSplit[1].substring(2, oldSplit[1].length);
    var oldObj = oldSplit[2].substring(1, oldSplit[2].length - 2);

    var newPred = newSplit[1].substring(2, newSplit[1].length);
    var newObj = newSplit[2].substring(1, newSplit[2].length - 2);

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

export async function deleteTriples(endpoint, root) {
    //Array to keep track of all statements to delete
    orderedStatements = [];
    //assign endpoint
    solidAddress = endpoint;
    
    
    // create a new local store
    var store = $rdf.graph();
    // create fetcher/updater used to manage store
    var updater = new $rdf.UpdateManager(store);
    var fetcher = new $rdf.Fetcher(store);

    //fetches all the triples
    await fetcher.load(endpoint);  

    //recursive array to go down the tree and find all statements to delete based on specified root
    createDeleteArray(root, store, orderedStatements, solidAddress);

    //Deletes all statements found by recursive function
    new Promise((accept, reject) => updater.update(orderedStatements, [],
        (uri, ok, message) => {
            if (ok)
                accept();
            else
                reject(message);
        }));
}

function createDeleteArray(root, store, statementsToDelete, endpoint) {
    //This is a recursive function    

    //End condition, if it hits a literal for example: "John Doe" 
    if (!root.includes(endpoint)) {
        //end of branch
    }
    //If not a literal, keep going down the tree
    else {
        //this store.match matches all triples that branch off the root node
        let quads = store.match(store.sym(root), null, null, null);
        

        for (var i = 0; i < quads.length; i++) {
            //if it is not the type node
            if (!quads[i].predicate.value.includes("#type")) {
                 //add statement to define what branches off root node
                statementsToDelete.push(quads[i]);

                //Keep going down the tree 
                createDeleteArray(quads[i].object.value, store, statementsToDelete, endpoint);
                
            
            }
            //if it is a type node
            else {
                //add statement to define the triple's rdf type
                statementsToDelete.push(quads[i]);
                
            }
        }



    }
    //This global array of statements keeps track of the statements to delete 
    orderedStatements = statementsToDelete;

}



function prependSolid(orderedArray, store, updater) {
    var insertstatements = [];
    var finalStatements = [];

    for (var i = 0; i < orderedArray.length; i++) {
        //If it designating a child node
        var arrTest = orderedArray[i].split(" ");
        if (orderedArray[i].split("<").length === 2) {

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

                store.add(me, store.sym(tempArr[1].substring(1, tempArr[1].length - 1)), store.sym(tempArr[2].substring(1, tempArr[2].length - 1)), profile);

                orderedArray[i] = tempArr.join(" ");
            }
            else {
                //prepend to subject node, leave object alone since it contains a value (like "DOE")
                tempArr = orderedArray[i].split(" ");
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
                    me = 
                    store.add(me, store.sym(tempArr[1].substring(1, tempArr[1].length - 1)), tempArr[2].substring(0, tempArr[2].length), profile);

                    orderedArray[i] = tempArr[0] + " " + tempArr[1] + " " + tempArr[2];
                }
                else {


                    tempArr[0] = tempArr[0].substring(6, tempArr[0].length);
                    tempArr[0] = "<" + solidAddress + tempArr[0] + ">";
                    tempArr[2] = tempArr[2].substring(1, tempArr[2].length - 1);

                    //upload to solid pod
                    me = store.sym(tempArr[0].substring(1, tempArr[0].length - 1));
                    profile = me.doc();

                    store.add(me, store.sym(tempArr[1].substring(1, tempArr[1].length - 1)), tempArr[2].substring(0, tempArr[2].length), profile);

                    orderedArray[i] = tempArr.join(" ");
                }
            }
        }
        //Else it is a node definition
        else {

            tempArr = orderedArray[i].split(" ");
            tempArr[0] = tempArr[0].substring(6, tempArr[0].length);

            //prepend to subject node
            tempArr[0] = "<" + solidAddress + tempArr[0] + ">";

            //upload to solid pod
            me = store.sym(tempArr[0].substring(1, tempArr[0].length - 1));
            profile = me.doc();

            store.add(me, store.sym(tempArr[1].substring(1, tempArr[1].length - 1)), store.sym(tempArr[2].substring(1, tempArr[2].length - 1)), profile);

            orderedArray[i] = tempArr.join(" ");
        }
    }

    insertstatements = store.match(null, null, null, profile);

    for (let k = 0; k < insertstatements.length; k++) {
        finalStatements.push(insertstatements[k])
    }

    new Promise((accept, reject) => updater.update([], finalStatements,
        (uri, ok, message) => {
            if (ok)
                accept();
            else
                reject(message);
        }));
}




function parseBranches(branches, initialFile, parents) {
    return new Promise(resolve => {

        var branchNum = branches.length;

        //Go through each branch and find children. if no children end, else recursively call function to keep going down the branch
        for (var i = 0; i < branchNum; i++) {

            var newBranches = [];
            var branchNode = branches[i].split(regExp2);
            //Array holds subject to be extracted and kept track of along the recursive function

            var subject = branches[i].split(" ");
            if (!parents.includes(subject[0].substring(6, subject[0].length))) {
                parents.push(subject[0].substring(6, subject[0].length));

            }
            //parents.push(subject[0].substring(6,subject[0].length));


            if (branchNode.length === 3) {
                for (var j = 0; j < initialFile.length; j++) {
                    //We must perform two splits to isolate the subject value so we can match our branches object with the
                    //corresponding object
                    if (initialFile[j].length === 0) {
                        continue;
                    }
                    var split1 = initialFile[j].split(regExp1);
                    var split2 = split1[1].split(" ");


                    if (split2[0].toLowerCase() === branchNode[2].toLowerCase().substring(0, branchNode[2].length - 2) && initialFile[j] !== branches[i]) {
                        if (initialFile[j].split("<").length === 2 && initialFile[j].split(regExp1).length === 3) {

                            //
                            // TODO: Remove IBE GUIDs 
                            //


                            //uncomment for full length node paths in uri
                            //var tempParentString = parents.join("/");
                            var insertParent = initialFile[j].split(regExp1);

                            matchRegExp = regExp1.exec(initialFile[j]);
                            //var getChildString = insertParent[1].split(" ");

                            //insertParent[1] = tempParentString + "/" + insertParent[1];
                            //insertParent[2] = tempParentString + "/" + getChildString[0] + "/" + insertParent[2];
                            insertParent = insertParent.join(matchRegExp[0]);



                            //This is the node that defines its children are, this is tracked by newBranches
                            newBranches.push(initialFile[j]);

                            orderedArray.push(insertParent);


                        }
                        else if (initialFile[j].split("<").length === 2 && initialFile[j].split(regExp1).length === 2) {

                            //
                            // TODO: Remove IBE GUIDs 
                            //

                            //uncomment for full length node paths in uri
                            //tempParentString = parents.join("/");

                            insertParent = initialFile[j].split(regExp1);


                            matchRegExp = regExp1.exec(initialFile[j]);

                            //insertParent[1] = tempParentString + "/" + insertParent[1];
                            insertParent = insertParent.join(matchRegExp[0]);
                            orderedArray.push(insertParent);

                        }
                        else {

                            //
                            // TODO: Remove IBE GUIDs 
                            //
                            //uncomment for full length node paths in uri
                            //tempParentString = parents.join("/");

                            insertParent = initialFile[j].split(regExp1);

                            matchRegExp = regExp1.exec(initialFile[j]);

                            //insertParent[1] = tempParentString + "/" + insertParent[1];
                            insertParent = insertParent.join(matchRegExp[0]);
                            //This is the type identifier node, this can be immediately added to ordered array
                            orderedArray.push(insertParent);
                        }
                    }

                }
            }
            //Base case for recursive function, it means the recursion has reached the end node of the branch
            if (newBranches.length === 0) {
                //END OF RECURSION, nothing else needed to do
            }

            else {
                //Else you haven't hit the end, keep going!
                parseBranches(newBranches.slice(), initialFile, parents.slice(0));
            }
        }

        resolve();
    })
}

function addGUID(orderedArray) {
    var dict = {};

    for (var i = 0; i < orderedArray.length; i++) {
        var temp = orderedArray[i];


        if (temp.split("<").length === 3) {
            temp = temp.split(" ");
            console.log(temp[0]);
            if (!checkForGUID(temp[0])) {
                if(temp[0].replace(new RegExp("[0-9]"), "") === '_:cco_me') {
                    console.log('indeere')
                    dict[temp[0].substring(6)] = ['me', ""];
                    continue;
                }
                var nodeType = temp[2].split("/");
                nodeType = nodeType[4].substring(0, nodeType[4].length - 1);

                var start = new Date().getTime();
                var end = start;
                while (end < start + 2) {
                    end = new Date().getTime();
                }
                dict[temp[0].substring(6)] = [nodeType, end];

            }


        }

    }
    for (i = 0; i < orderedArray.length; i++) {
        if (orderedArray[i].split(regExp1).length === 3) {

            temp = orderedArray[i];
            temp = temp.split(" ");

            temp[0] = temp[0].substring(0, 6) + dict[temp[0].substring(6)][0] + dict[temp[0].substring(6)][1];
            temp[2] = temp[2].substring(0, 6) + dict[temp[2].substring(6)][0] + dict[temp[2].substring(6)][1];

            orderedArray[i] = temp.join(" ");

        }
        else {
            temp = orderedArray[i];
            temp = temp.split(" ");

            temp[0] = temp[0].substring(0, 6) + dict[temp[0].substring(6)][0] + dict[temp[0].substring(6)][1];

            orderedArray[i] = temp.join(" ");

        }

    }



}

function checkForGUID(check, dict) {

    if (dict === undefined) {
        return false;
    }
    else {
        return dict.hasOwnProperty(check.substring(6));
    }

}



function parseNTFile(fileString, rootNode) {

    console.log("Parsing given .nt file...");

    //split file on new lines
    var fileArray = fileString.split(/\r?\n/);
    var fileLineNum = fileArray.length;

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
            rootArray.push(fileArray[i]);
        }
    }


    for (i = 0; i < rootArray.length; i++) {
        var spaces = rootArray[i].split("<");

        //finds root triple based on the number of splits in the array of triples that contain the specified root node keword (such as "person")
        if (spaces.length === 3) {
            rootTriple = rootArray[i];

            orderedArray.push(rootTriple);


        }
        //Finds a branch off of the root node
        else {
            rootBranches.push(rootArray[i]);

        }
    }
    //added outside of initial for loop of rootArray to ensure the root is ordered first

    for (i = 0; i < rootBranches.length; i++) {
        //We must prepend the subject to the object node, for instance 'person a propername' is transformed to 'person a person/propername'
        //This only needs to be done for the intial branches and we are still passing 'person a propername' into the recursive function since 
        //'person a person/propername' messes up the recursive function based on how I am doing it currently
        var temp = rootBranches[i].split(regExp1);
        matchRegExp = regExp1.exec(rootBranches[i]);



        //uncomment for full length ibe with node path
        //var subject = temp[1].split(" ");
        //temp[2] = subject[0] + "/" + temp[2];


        //uncomment for full length ibe with node path
        var tempRootBranches = temp.join(matchRegExp[0]);

        orderedArray.push(tempRootBranches);



    }

    //initate recursive function given the initial root node and its children
    parseBranches(rootBranches, fileArray, []);

    //Completed ordering, tracked by the array "orderedArray"
    console.log("Done...");
    console.log("The complete parsed .nt file is " + orderedArray.length + " lines long");

}



export async function run(file, rootNode, endpoint) {
    return new Promise(
        async (resolve, reject) => {
            var store = $rdf.graph();
            var updater = new $rdf.UpdateManager(store);
            solidAddress = endpoint;
            rootFileNode = rootNode;
            orderedArray.length = 0;
            await parseNTFile(file, rootFileNode);
            addGUID(orderedArray);
            prependSolid(orderedArray, store, updater);
            resolve();
        }
    )

}
