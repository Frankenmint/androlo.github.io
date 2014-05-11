/************************************
 *          Initialization          *
 ************************************/

var dougADDR = "0xb151e7bc0da69909125586dd570cc2ab8a94661f";

var dougName = "doug";

var dbADDR = eth.storageAt(dougADDR, "database");
var usersADDR = eth.storageAt(dougADDR, "users");
var voteADDR = eth.storageAt(dougADDR, "votes");

var dbAddrii = new Array();
var currentAddress = null;

var infohashes = new Array();
var contractAddrii = new Array();
var currentContractName = null;

var nicks = new Array();
var userPerms = new Array();
var addrii = new Array();

window.onload = function(){
	
	dougADDR = eth.storageAt(dougADDR,dougName.unbin().pad(0,32));

	if(isNull(dougADDR)){
		window.alert("Could not find DOUG contract by address. Page will not work.");
	}	
	
	var myNick = getMyNick();
	
	if(myNick == ""){
			document.getElementById("adminLinkL").innerHTML = "Register";
			switchPage(3);
	}
	
	prepareDatabasePage();
}


/************************************
 *              Menu                *
 ************************************/

switchPage = function(callerID){

   if(callerID == "0"){
		document.getElementById("containerDatabase").style.display = "block";
		document.getElementById("containerConsensus").style.display = "none";
		document.getElementById("containerAbout").style.display = "none";
		document.getElementById("containerAdmin").style.display = "none";
		prepareDatabasePage();
	} else if(callerID == "1"){	
		document.getElementById("containerDatabase").style.display = "none";
		document.getElementById("containerConsensus").style.display = "block";
		document.getElementById("containerAbout").style.display = "none";
		document.getElementById("containerAdmin").style.display = "none";
		
		if(getMyUserLevel() > 1){
			document.getElementById("pollViewMenu").style.display = "block";
		} else {
			document.getElementById("pollViewMenu").style.display = "none";
		}
		
	} else if(callerID == "2"){
		document.getElementById("containerDatabase").style.display = "none";
		document.getElementById("containerConsensus").style.display = "none";
		document.getElementById("containerAbout").style.display = "block";
		document.getElementById("containerAdmin").style.display = "none";
	} else if(callerID == "3"){
		document.getElementById("containerDatabase").style.display = "none";
		document.getElementById("containerConsensus").style.display = "none";
		document.getElementById("containerAbout").style.display = "none";
		document.getElementById("containerAdmin").style.display = "block";
		if(getMyNick() == ""){
			document.getElementById("registerSection").style.display = "block";
			document.getElementById("adminEditSection").style.display = "none";
			document.getElementById("userTableSection").style.display = "none";
		} else {
			document.getElementById("registerSection").style.display = "none";
			document.getElementById("adminEditSection").style.display = "block";
			document.getElementById("userTableSection").style.display = "block";
			// If I'm an admin.
			var myLevel = getMyUserLevel();
			if (myLevel > 1) {
				document.getElementById("adminButtons").style.display = "block";
			} else {
				document.getElementById("adminButtons").style.display = "none";			
			}
		}
		
	}
	
}

/************************************
 *         Database stuff           *
 ************************************/

prepareDatabasePage = function(){
	
	var myNick = getMyNick();
	
	if(myNick == ""){
		// Fix the input fields.
		document.getElementById('uploaderInputField').disabled = true;
		document.getElementById('submittedInputField').disabled = true;
		document.getElementById('modifiedInputField').disabled = true;
		document.getElementById('titleInputField').disabled = true;
		document.getElementById('descriptionTextArea').disabled = true;
		document.getElementById('createDocumentButton').style.display = "none";
		document.getElementById('updateDocumentButton').style.display = "none";
		
	} else {
		document.getElementById('uploaderInputField').disabled = true;
		document.getElementById('submittedInputField').disabled = true;
		document.getElementById('modifiedInputField').disabled = true;
		document.getElementById('titleInputField').disabled = false;
		document.getElementById('descriptionTextArea').disabled = false;
		document.getElementById('createDocumentButton').style.display = "block";
		document.getElementById('updateDocumentButton').style.display = "none";
	}
	document.getElementById('deleteDocumentButton').style.display = "none";
	
	document.getElementById('uploaderInputField').value = myNick;
	document.getElementById('submittedInputField').value = "";
	document.getElementById('modifiedInputField').value = "";
	document.getElementById('titleInputField').value = "";
	document.getElementById('descriptionTextArea').value = "";
	currentAddress = null;
	
}

generateTable = function(){
	
	var pointer = "0x17" // current tail
	pointer = eth.storageAt(dbADDR,pointer); // now points to address to list element 0	
	var elems = parseInt(eth.storageAt(dbADDR,"0x16"),16);
	
	if(elems == 0){
		return;
	}
	
	var titles = new Array();
	dbAddrii = new Array();
	
	for(var counter = 0; counter < elems; counter++) {
		var titlePointer = addHex(pointer,"0x5"); // Get title
		var tstr = eth.storageAt(dbADDR, titlePointer).bin();
		titlePointer = addHex(titlePointer,"0x1");
		tstr = tstr + eth.storageAt(dbADDR, titlePointer).bin();
		titles[counter] = tstr;
		dbAddrii[counter] = pointer;
		pointer = addHex(pointer,"0x1");
		if(!isNull(pointer)){
			pointer = eth.storageAt(dbADDR,pointer);
		}
	}
	
	var table= "<table>";
		
	for (var j = 0; j < titles.length; j++) {
			table+='<tr><td><a href="javascript:void(0)" onclick="resolveMagnetLink(' + '&quot;' + j + '&quot;' + ');">' + 
			titles[j] + '</a></td></tr>';
	}
	
	table+="</table>";
	document.getElementById('datatable').innerHTML = table;

}

resolveMagnetLink = function(addrIndexStr)
{
	var index = parseInt(addrIndexStr);
	currentAddress = dbAddrii[index];
	
	var pointer = addHex(dbAddrii[index],"0x2");
	
	var uploader = eth.storageAt(dbADDR, pointer).bin();
	pointer = addHex(pointer, "0x1");
	
	var submitted = eth.storageAt(dbADDR, pointer);
	pointer = addHex(pointer, "0x1");
	
	var modified = eth.storageAt(dbADDR, pointer);
	pointer = addHex(pointer, "0x1");	
	
	var title1 = eth.storageAt(dbADDR, pointer).bin();
	pointer = addHex(pointer, "0x1");
	var title2 = eth.storageAt(dbADDR, pointer).bin();
	var title = title1 + title2;
	pointer = addHex(pointer, "0x1");
	var sz = parseInt(eth.storageAt(dbADDR,pointer),16);
	var desc = "";
	for (var i = 0; i < sz; i++) {
		pointer = addHex(pointer, "0x1");
		var temp = eth.storageAt(dbADDR, pointer).bin();
		desc = desc + temp;
	}
	
	var date = new Date(parseInt(submitted,16)*1000);
	
	var dateString = date.getFullYear().toString() + "/" + (date.getMonth() + 1).toString() + "/" + 
	date.getDate().toString();
	
	dateString += " " + date.getHours().toString() + ":" + date.getMinutes().toString() + 
	":" + date.getSeconds().toString();
		
	date = new Date(parseInt(modified,16)*1000);
	
	var dateString2 = date.getFullYear().toString() + "/" + (date.getMonth() + 1).toString() + "/" + 
	date.getDate().toString();
	
	dateString2 += " " + date.getHours().toString() + ":" + date.getMinutes().toString() + 
	":" + date.getSeconds().toString();
	
	
	document.getElementById('uploaderInputField').value = uploader;
	document.getElementById('submittedInputField').value = dateString;
	document.getElementById('modifiedInputField').value = dateString2;
	document.getElementById('titleInputField').value = title;
	document.getElementById('descriptionTextArea').value = desc;
	
	var myNick = getMyNick();
	if(myNick != ""){
		if(myNick == uploader){
			// Fix the input fields.
			document.getElementById('uploaderInputField').disabled = true;
			document.getElementById('submittedInputField').disabled = true;
			document.getElementById('modifiedInputField').disabled = true;
			document.getElementById('titleInputField').disabled = false;
			document.getElementById('descriptionTextArea').disabled = false;
			// Fix the buttons.		
			document.getElementById('updateDocumentButton').style.display = "block";
			document.getElementById('deleteDocumentButton').style.display = "block";
		} else {
			// Fix the input fields.
			document.getElementById('uploaderInputField').disabled = true;
			document.getElementById('submittedInputField').disabled = true;
			document.getElementById('modifiedInputField').disabled = true;
			document.getElementById('titleInputField').disabled = true;
			document.getElementById('descriptionTextArea').disabled = true;
			
			document.getElementById('updateDocumentButton').style.display = "none";
			var myLevel = getMyUserLevel();
			if(myLevel > 1){				
				document.getElementById('deleteDocumentButton').style.display = "block";			
			} else {
				document.getElementById('deleteDocumentButton').style.display = "none";			
			}
		}
		document.getElementById('createDocumentButton').style.display = "none";
	}
	
}

createDocument = function()
{
	
	var myNick = getMyNick();
	
	var title = document.getElementById("titleInputField").value.unbin().pad(0,64);
	
	var descriptText = document.getElementById("descriptionTextArea").value;
	var sz = Math.ceil(descriptText.length*1.0 / 32);
	if(sz == 0){
		window.alert("Description is empty.");
		return;	
	}
	
	var descript = descriptText.unbin().pad(0,sz*32);
	var command = toPayload("insert");
	
	var payload = command + title + sz.toString().pad(32) + descript;
	//document.getElementById('submittedInputField').value = typeof command;
	eth.transact(eth.key, "0", dbADDR, payload, "10000", eth.gasPrice, dummyTransCallback);
	
};

updateDocument = function()
{
	
	var title = document.getElementById("titleInputField").value.unbin().pad(0,64);
	
	var descriptText = document.getElementById("descriptionTextArea").value;
	var sz = Math.ceil(descriptText.length*1.0 / 32);
	if(sz == 0){
		window.alert("Description is empty.");
		return;	
	}
	
	var descript = descriptText.unbin().pad(0,sz*32);
	var command = toPayload("modify");
	
	var payload = command + BigInteger(currentAddress).toString().pad(32) + title + sz.toString().pad(32) + descript;
	//document.getElementById('submittedInputField').value = currentAddress;
	eth.transact(eth.key, "0", dbADDR, payload, "10000", eth.gasPrice, dummyTransCallback);
	
};

deleteDocument = function()
{
	var payload = toPayload("delete") + BigInteger(currentAddress).toString().pad(32);

	eth.transact(eth.key, "0", dbADDR, payload, "10000", eth.gasPrice, dummyTransCallback);	
	clearDocument();
};

clearDocument = function()
{
	prepareDatabasePage();
};

/************************************
 *         Consensus stuff          *
 ************************************/

readContractMeta = function(contractDataSlot)
{
	
	var index = parseInt(contractDataSlot);

	var ADDR = contractAddrii[index];

	var metaident = eth.storageAt(ADDR, "0x0");
	
	if (hexToVal(metaident) == 585546221227) {
		
		var creat = eth.storageAt(ADDR, "1");
		
		var auth = eth.storageAt(ADDR, "2").bin();

		var da = hexToVal(eth.storageAt(ADDR, "3"));
		var date = new Date(da*1000);
	
		var dateString = date.getFullYear().toString() + "/" + (date.getMonth() + 1).toString() + "/" + 
		date.getDate().toString();
	
		dateString += " " + date.getHours().toString() + ":" + date.getMinutes().toString() + 
		":" + date.getSeconds().toString();

		var ve = eth.storageAt(ADDR, "4").bin();

		var name = eth.storageAt(ADDR, "5").bin();

		var desc = "";
		for (var i = 6; i <= 15; i++) {
			var temp = eth.storageAt(ADDR, i.toString()).bin();
			desc = desc + temp;
		}

		document.getElementById('contractRegname').value = currentContractName;
		document.getElementById('contractAddress').value = ADDR.substring(2);
		document.getElementById('contractCreator').value = creat.substring(2);
		document.getElementById('contractAuthor').value = auth;
		document.getElementById('contractDate').value = dateString;
		document.getElementById('contractVersion').value = ve;
		document.getElementById('contractName').value = name;
		document.getElementById('contractDescriptionTextArea').value = desc;
	};
	
}
	
generatePollTable = function(){

	// Get tail at 0x18
	var pointer = eth.storageAt(voteADDR,"0x12");
	
	contractAddrii = new Array();

	var contractNames = new Array();
	
	var sz = hexToVal(eth.storageAt(voteADDR, "0x11"));
	
	var table= "<table><tr><td>Poll</td></tr>";
	
	for(var counter = 0; counter < sz; counter++){
		var next = addHex(pointer,"0x2");
		contractNames[counter] = pointer.bin();
		currentContractName = contractNames[counter];
		pointer = eth.storageAt(voteADDR,pointer);
		pointer = eth.storageAt(voteADDR,pointer);
		contractAddrii[counter] = pointer;
		
		table+='<tr><td><a href="javascript:void(0)" onclick="readContractMeta(' + '&quot;' + 
		counter + '&quot;' + ');">' + contractNames[counter] + '</a></td></tr>';		
		
		pointer = eth.storageAt(voteADDR,next);
	}
	
	
	
	table+="</table>";
	document.getElementById('pollTable').innerHTML = table;
}

vote = function(yesno){
	document.getElementById('contractAddress').value = currentContractName;
	var payload = "vote".unbin().pad(0,32) + currentContractName.unbin().pad(0,32) + yesno.toString().pad(32);
	eth.transact(eth.key, "0", dougADDR, payload, "100000", eth.gasPrice, dummyTransCallback);
}


/************************************
 *       User related stuff         *
 ************************************/

removeUser = function(){
	
	var userName = document.getElementById("userNicknameInputField").value;

	if(userName == null || userName == ""){
		window.alert("No user name has been specified.");
		return;
	}
	
	if(userName == getMyNick()){
			window.alert("If you want to remove yourself, use the 'Delete Me' command.");
			return;
	}
	
	var sure = confirm("Are you sure you want to delete member: " + userName + "?");	
	if(!sure){
		window.alert("User was not removed.");
		return;
	}
	
	var payload = "dereg".unbin().pad(0,32) + userName.unbin().pad(0,32);

	eth.transact(eth.key, "0", usersADDR, payload, "100000", eth.gasPrice, dummyTransCallback);
	
}

promoteUser = function(){
	
	var userName = document.getElementById("userNicknameInputField").value;

	if(userName == null || userName == ""){
		window.alert("No username has been specified.");
		return;
	}
	
	var sure = confirm("Are you sure you want to promote user: " + userName + 
								"?\n\nThey will be given administrator privileges.");
	
	if(!sure){
		window.alert("User was not promoted.");
		return;	
	}
	
	var payload = "promote".unbin().pad(0,32) + userName.unbin().pad(0,32);

	eth.transact(eth.key, "0", usersADDR, payload, "100000", eth.gasPrice, dummyTransCallback);
	
}

deleteMe = function(){
	
	var sure = confirm("Are you sure you want to delete your own account?");	
	if(!sure){
		window.alert("Account not deleted.");
		return;	
	}
	if(getMyUserLevel() > 1){
		var superSure = confirm("Are you sure? You will loose your admin privileges.");	
		if(!superSure){
			window.alert("Account not deleted.");
			return;
		}
	}
	
	var payload = "dereg".unbin().pad(0,32);
	eth.transact(eth.key, "0", usersADDR, payload, "100000", eth.gasPrice, dummyTransCallback);
	window.alert("Your account will be removed shortly.");
	
}

generateUserTable = function(){
	
	var pointer = "0x12"; // Tail
	// Size of the linked list.
	var size = hexToVal(eth.storageAt(usersADDR, "0x11"));
	nicks = new Array();
	addrii = new Array(); // Deal with it
	userPrivs = new Array();
	
	for (var i = 0; i < size; i++) {
		pointer = eth.storageAt(usersADDR, pointer);
		var nick = pointer.bin();
		var priv = eth.storageAt(usersADDR,subHex(pointer,"0x1")); 
		nicks[i] = nick;
		addrii[i] = eth.storageAt(usersADDR,pointer);
		
		userPrivs[i] = isNull(priv) ? 0 : hexToVal(priv);
		pointer = addHex(pointer, "0x2");
	};
	
	var table= "<table><tr><td>Nickname</td><td>Type</td></tr>";
	
	for (var j = 0; j < nicks.length; j++) {
		var userTypeStr = null;
		switch(userPrivs[j])
		{
			case 0:
		  		userTypeStr = "Squatter";
		  		break;
			case 1:
		  		userTypeStr = "Member";
				break;
			default:
			  userTypeStr = "Admin";
		}
		
		table+='<tr><td><a href="javascript:void(0)" onclick="resolveUserLink(' + '&quot;' + 
		j + '&quot;' + ');">' + nicks[j] + '</a></td><td>' + userTypeStr + '</td></tr>';
	}
	
	table+="</table>";
	document.getElementById('userTable').innerHTML = table;
	
}

resolveUserLink = function(userIndex)
{
	var index = parseInt(userIndex);
	document.getElementById('userAddressInputField').value = addrii[index];
	if(userPrivs[index] > 1){
		document.getElementById('adminRadio').checked = true;		
	} else {
		document.getElementById('userRadio').checked = true;	
	}
		document.getElementById('userNicknameInputField').value = nicks[index];
	
}

registerNickname = function(){
	
	var nameString = document.getElementById("registerNicknameInputField").value;
	if(nameString == null || nameString == ""){
		window.alert("There is no name in the nickname field.");
		return;
	}

	var addr = getAddressFromNick(nameString);
	
	if(!isNull(addr)){
		window.alert("That nickname is already in use.");
		return;
	}
	
	var payload = "reg".unbin().pad(0,32) + nameString.unbin().pad(0,32);
	//document.getElementById("registerNicknameInputField").value = payload;
	eth.transact(eth.key, "0", usersADDR, payload, "100000", eth.gasPrice, dummyTransCallback);
}

/************************************
 *     DOUG utility functions       *
 ************************************/

// Returns nickname as a u256 object.
getMyNickHex = function(){
	var myAddr = eth.secretToAddress(eth.key);
	var myNickHex = eth.storageAt(usersADDR, myAddr);
	if(isNull(myNickHex)) {
		return "0x0";
	}
	return myNickHex;
}

// Returns nickname as a string.
getMyNick = function(){
	var myNameHex = getMyNickHex();
	if(myNameHex == "0x0"){
		return "";
	}
	return myNameHex.bin().trim();
	
}

// Returns user level as a number.
getMyUserLevel = function(){
	
	var myLevHex = eth.storageAt(usersADDR,subHex(getMyNickHex(),"0x1"));
	// Should not happen.	
	if(isNull(myLevHex)){
		return 0;
	}
	return hexToVal(myLevHex);
}

getAddressFromNick = function(nickName){
	
	return eth.storageAt(usersADDR,nickName);
	
}

/************************************
 *     DOUG utility functions       *
 ************************************/

// Takes two integer strings, turns them into decimal numbers, adds, then return the sum as an integer string.
add = function(val1,val2){
	return BigInteger(val1).add(val2).toString();
}

// Adds two hex numbers (as strings) and returns a new hex string
addHex = function(hex1,hex2){
	return "0x" + BigInteger(hex1).add(hex2).toString(16);
}

// Takes two integer strings, turns them into decimal numbers, subtracts, then return the sum as an integer string.
sub = function(val1,val2){
	return BigInteger(val1).subtract(val2).toString();;
}

// Subtract two hex numbers (as strings) and returns a new hex string
subHex = function(hex1,hex2){
	return "0x" + BigInteger(hex1).subtract(hex2).toString(16);
}

// Checks if a hex-string is 0
isNull = function(hex){
	return (hex == "0x") ? true : false;
}

// Takes a hex-string and returns its integer decimal value as a number.
hexToVal = function(hex){
	return parseInt(hex,16);
}

// takes a decimal number and turns it into a proper hex string ("0x" + hexStr)
valToHex = function(val){
	return "0x" + val.toString();
}

toPayload = function(someText){
	return toPayloadSz(someText,32);
}

toPayloadSz = function(someText,sz){
	return someText.unbin().pad(0,sz);
}

dummyTransCallback = function(){

}

registerNickCallback = function(){
	window.alert("You have been registered. The page will be reloaded.");
	window.location.reload(true);
}
