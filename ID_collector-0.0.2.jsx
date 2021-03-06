/*
	File Collector ver.0.0.2 beta
	beta release : 2014.11.12
	update release : 2015.1.28
	Open document in Indesign and run it, Will collect linked files.
	If linked files has link files,  collect them in same folder.
*/

if (app.documents.length>0){
	var dst = Folder.selectDialog("select New Folder").fsName +"/";
	if (app.activeDocument.links.length>0) {
		var lnks = app.activeDocument.links;
		var fldrs = [];
		var lk = [];
		var tg;
		var fls = Folder(app.activeDocument.filePath).getFiles();
		fldrs.push(Folder(app.activeDocument.filePath).fullName);

		for (var i=0;i<fls.length;i++) 
			if (fls[i].type==undefined) 
				fldrs.push(fls[i].fullName);

		for (i=0;i<lnks.length;i++){
			fileObj = File(app.activeDocument.links[i].filePath);
			fileObj.copy(File(dst + app.activeDocument.links[i].name));
			if (app.activeDocument.links[i].filePath.substr(
				app.activeDocument.links[i].filePath.length-2,
				app.activeDocument.links[i].filePath.length)!="ai") {
					continue; 
					}
			lk = getLinks(fileObj.fsName);
			//$.writeln(lk)
			if (lk.length==0) continue;
			for (j=0;j<lk.length;j++){
				for (k=0;k<fldrs.length;k++){
					tg = File(fldrs[k] + "/" + lk[j]);
					//$.writeln(tg.fsName);
					if (!tg.exists) continue;
					//$.writeln(dst + lk[j]);
					tg.copy(dst + lk[j]);
					break;
					}
				}
			}
		}
	app.activeDocument.save(dst+app.activeDocument.name);
	}


function getLinks (fls){
	var prop = "Manifest";
	var ns ="http://ns.adobe.com/xap/1.0/mm/";
	if(xmpLib==undefined) 
		var xmpLib = new ExternalObject('lib:AdobeXMPScript');
	var xmpFile = new XMPFile(fls, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_READ);
	var xmpPackets = xmpFile.getXMP();
	var xmp = new XMPMeta(xmpPackets.serialize());
	var str = "";
	var result = [];
	for (var i=1;i<=xmp.countArrayItems(ns,prop);i++){
		str = xmp.getProperty(ns, prop + "[" + i + "]" + "/stMfs:reference/stRef:filePath").toString();
		result.push(str.slice(str.lastIndexOf("/")+1));
		}
	return result;
	}


