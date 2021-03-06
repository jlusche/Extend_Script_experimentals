﻿function navBar() {}

navBar.prototype.run = function(){
	if ($._idmeta==undefined) defineIDMeta();
	function buildNavbar(doc) {
		var bb = doc.navbars.filesystem.bottom;
		bb.visible = true;
		bb.height = 45;
		bb.pnl = bb.add("panel", [5, 5, 600,30], "");
		bb.pnl.tx1 = bb.pnl.add( 'statictext',[3, 3, 395, 20],"");
		bb.pnl.browseBtn = bb.pnl.add( "button",[400, 3, 485, 20],"edit memo");
		bb.pnl.browseBtn.onClick = function() {
			if (app.document.selections[0].type=="file") $._idmeta.win();
			}
		bb.pnl.delBtn = bb.pnl.add( "button",[500, 3, 590, 20],"delete all");
		bb.pnl.delBtn.onClick = function() {
			if (app.document.selections[0].type=="file") $._idmeta.del();
			}
		}
	for(var j=0;j<app.documents.length;j++) {
		buildNavbar(app.documents[j]);
		}

	onMyChangeEvent = function( event ) {
		if(event.object instanceof Document) {
			if(event.type == "selectionsChanged") {
				if(event.object.navbars.filesystem.bottom != null && event.object.navbars.filesystem.bottom.pnl != null){
					var thumb = (event.object.selections[0] != undefined) ? event.object.selections[0] : event.object.thumbnail;
					event.object.navbars.filesystem.bottom.pnl.tx1.text = thumb.name;
					try{
						if (app.document.selections[0].type=="file"){
							var xmpFile,xmp,xmpPackets,dp;
							if(xmpLib==undefined) {
								if(Folder.fs=="Windows") var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.dll";
								else var pathToLib = Folder.startup.fsName + "/AdobeXMPScript.framework";	
								var libfile = new File(pathToLib);
								var xmpLib = new ExternalObject("lib:"+pathToLib);
								}
							xmpFile = new XMPFile(app.document.selections[0].path, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_READ);
							xmpPackets = xmpFile.getXMP();
							xmp = new XMPMeta(xmpPackets.serialize());
							dp = xmp.dumpObject();
							if (dp.match(/memo\d/g)!=null) 
								event.object.navbars.filesystem.bottom.pnl.tx1.text += "\tメモ有"
							}
						}catch(e){}
					}
				else {
					if(event.object instanceof Document) {try{buildNavbar(event.object);}catch(e){}}
					}
				}
			
			}
		return false; // continue with other handlers
		}

	app.eventHandlers.push( {handler: onMyChangeEvent});
	return true;
	}


function defineIDMeta() {
	$._idmeta ={
		ns : "http://ns.chuwa.sytes.net/idcomment/1.0/",
		prefix : "ID_meta:",
		f : new Object(),
		win : function(){
			var n = this.getLen();
			var i = 0;
			var w = new Window('dialog', 'meta memo', undefined);
			var y = 5;
			if (n>0){
				for (i=1;i<n+1;i++){
					eval("var p"+ i +"= w.add('panel',[5,y,480,y+75],'memo" + i + "');");
					eval("var t"+ i +"=p"+ i +".add('edittext',[5,8,370,60],'');");
					eval("t"+ i +".multiline=true");
					eval("t"+ i +".text=this.read('memo"+i+"');");
					eval("var dl"+ i +"= p"+ i +".add('button',[385,10,485,30],'delete');");
					eval("var bt"+ i +"= p"+ i +".add('button',[385,40,485,60],'update');");
					eval("bt"+i+".onClick=function (){" + "$._idmeta.write('memo" + i + "',t" + i + ".text);w.close();}");
					eval("dl"+i+".onClick=function (){" + "$._idmeta.remove('memo" + i + "'," + Number(i) + ");w.close()}");
					y += 60;
					}
				}
			var pn = w.add('panel',[5,y,480,y+75],'add new memo');
			var tx = pn.add('edittext',[5,10,350,60],'');
			tx.multiline = true;
			var b = pn.add('button',[380,40,465,60],'add new memo');
			if (i==0) i++;
			b.onClick = function (){
				$._idmeta.write("memo"+i, tx.text);
				w.close();
				}
			var cl = w.add('button', undefined, 'close');
			cl.onClick = function(){w.close();}
			w.show();
			},
		del : function(){
			var n = this.getLen();
			var flg = confirm ("全てのメモを消去しますか?");
			var prop = "",txt;
			if (flg){
				if(xmpLib==undefined) var xmpLib = new ExternalObject('lib:AdobeXMPScript');
				var xmpFile = new XMPFile(app.document.selections[0].path, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_UPDATE);
				var xmp = xmpFile.getXMP();
				var mt = new XMPMeta(xmp.serialize());
				XMPMeta.registerNamespace(this.ns, this.prefix);
				for (var i=1;i<=n;i++) mt.deleteProperty(this.ns, "memo" + i);
				if (xmpFile.canPutXMP(xmp)) xmpFile.putXMP(mt);
				xmpFile.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
				xmpLib.unload();
				app.document.selections[0].label = "";
				txt = app.document.navbars.filesystem.bottom.pnl.tx1.text.replace("\tメモ有", "");
				app.document.navbars.filesystem.bottom.pnl.tx1.text = txt;
				}
			},
		remove : function(prop,num){
			var n = this.getLen();
			var str = [];
			if(xmpLib==undefined) var xmpLib = new ExternalObject('lib:AdobeXMPScript');
			var xmpFile = new XMPFile(app.document.selections[0].path, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_UPDATE);
			var xmp = xmpFile.getXMP();
			var mt = new XMPMeta(xmp.serialize());
			XMPMeta.registerNamespace(this.ns, this.prefix);
			for (var i=1;i<n+1;i++) {
				if (i!=num) str.push(mt.getProperty(this.ns, "memo"+i, XMPConst.STRING).toString());
				}
			for (i=1;i<n+1;i++) mt.deleteProperty(this.ns, "memo" + i);
			for (i=1;i<n+1;i++) mt.setProperty(this.ns, "memo"+i, str[i-1]);
			if (xmpFile.canPutXMP(xmp)) xmpFile.putXMP(mt);
			xmpFile.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
			xmpLib.unload();
			if (n==1) {
				app.document.selections[0].label = "";
				app.document.navbars.filesystem.bottom.pnl.tx1.text = app.document.navbars.filesystem.bottom.pnl.tx1.text.replace("\tメモ有", "");
				}
			},
		read : function(prop){
			if(xmpLib==undefined) var xmpLib = new ExternalObject('lib:AdobeXMPScript');
			var xmpFile = new XMPFile(app.document.selections[0].path, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_READ);
			var xmpPackets = xmpFile.getXMP();
			var xmp = new XMPMeta(xmpPackets.serialize());
			return xmp.getProperty(this.ns, prop,XMPConst.STRING).toString();
			},
		write : function(prop, val){
			if(xmpLib==undefined) var xmpLib = new ExternalObject('lib:AdobeXMPScript');
			var xmpFile = new XMPFile(app.document.selections[0].path, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_UPDATE);
			var xmp = xmpFile.getXMP();
			var mt = new XMPMeta(xmp.serialize());
			XMPMeta.registerNamespace(this.ns, this.prefix);
			mt.setProperty(this.ns, prop, val);
			if (xmpFile.canPutXMP(xmp)) xmpFile.putXMP(mt);
			xmpFile.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
			app.document.selections[0].label = "メモ有";
			if (app.document.navbars.filesystem.bottom.pnl.tx1.text.match(/\tメモ有/)==null)
				app.document.navbars.filesystem.bottom.pnl.tx1.text += "\tメモ有"
			xmpLib.unload();
			},
		getLen : function(){
			if(xmpLib==undefined) var xmpLib = new ExternalObject('lib:AdobeXMPScript');
			var xmpFile = new XMPFile(app.document.selections[0].path, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_READ);
			var xmpPackets = xmpFile.getXMP();
			var xmp = new XMPMeta(xmpPackets.serialize());
			try{
				var len = xmp.dumpObject().match(/memo\d/g);
				if (len==null) return 0;
				else return len.length;
			}catch(e){
				return 0;
				}
			}
		}
	}

new navBar().run();
