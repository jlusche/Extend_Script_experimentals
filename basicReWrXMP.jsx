﻿XMPBasic = {
	ns : "http://chuwa.sytes.net/ft/1.0/",
	prefix : "faceTracker:",
	read : function(){
		if(xmpLib==undefined) var xmpLib = new ExternalObject('lib:AdobeXMPScript');
		var tgt = File.openDialog("Select source file", undefined, false);
		var xmpFile = new XMPFile(tgt.fsName, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_READ);
		var xmpPackets = xmpFile.getXMP();
		var xmp = new XMPMeta(xmpPackets.serialize());
		alert(xmp.getProperty(this.ns, "faces").toString());
		},
	write : function(f, val1, val2){ //f:fileObject, val1:String, val2:String
		if(xmpLib==undefined) var xmpLib = new ExternalObject('lib:AdobeXMPScript');
		var xmpFile = new XMPFile(f.fsName, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_UPDATE);
		var xmp = xmpFile.getXMP();
		var mt = new XMPMeta(xmp.serialize());
		XMPMeta.registerNamespace(this.ns, this.prefix);
		mt.setProperty(this.ns, "value1", val1);
		mt.setProperty(this.ns, "value2", val2);
		if (xmpFile.canPutXMP(xmp)) xmpFile.putXMP(mt);
		xmpFile.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
		}
	}

XMPBasic.write(File.openDialog(), "1", "2");
//XMPBasic.read();
		
