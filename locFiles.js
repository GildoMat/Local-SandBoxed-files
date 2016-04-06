/**
 * SandBoxed File Manager 
 * @author Mattiazzi Gildo
 * @company MMG sas
 * @version 1.0
 */
(function(obj) {
	"use strict";
	var FS = null;

	var ManageFilesErrors = function(e){
		var msg = '';
		switch (e.code) {
			case FileError.QUOTA_EXCEEDED_ERR:
				msg = 'QUOTA_EXCEEDED_ERR';
				break;
			case FileError.NOT_FOUND_ERR:
				msg = 'NOT_FOUND_ERR';
				break;
			case FileError.SECURITY_ERR:
				msg = 'SECURITY_ERR';
				break;
			case FileError.INVALID_MODIFICATION_ERR:
				msg = 'INVALID_MODIFICATION_ERR';
				break;
			case FileError.INVALID_STATE_ERR:
				msg = 'INVALID_STATE_ERR';
				break;
			default:
				msg = 'Unknown Error';
				break;
			};
		console.log('Error: [ ' + msg + ' ] - ' + e.message);
		};

	var LocalFile = function(libs){
		this.libs = libs;		//Link ad altre parti del programma
		this.fs = null;			//puntatore al file
		this.actPath = null;	//Contiene la path dove ho scritto l'ultima volta
		};

	LocalFile.prototype = { //******** Start Obgect
		Open: function( bytes ){
			//Inizializza il file system
			var FileApiSupported = !!(window.File && window.FileReader && window.FileList && window.Blob);
			if (FileApiSupported) {
				var that=this;
				var amountOfSpaceNeeded = bytes; //2*1024*1024*1024;
				var setUpOfflineMode = function(availableSpace){
					window.webkitRequestFileSystem(PERSISTENT, availableSpace, 
					function(f_s){that.fs=f_s;},ManageFilesErrors); 
					};
				navigator.webkitPersistentStorage.queryUsageAndQuota(
					function (usage, quota) {
						var availableSpace = quota - usage;
						if (availableSpace >= amountOfSpaceNeeded) {
							// We're fine; just continue to set up offline mode.
							setUpOfflineMode(availableSpace);
							return;
							}
						var requestingQuota = amountOfSpaceNeeded + usage;
						navigator.webkitPersistentStorage.requestQuota(
							requestingQuota,
							function (grantedQuota) {
								setUpOfflineMode(grantedQuota - usage);
								},
							ManageFilesErrors);
						},
					ManageFilesErrors);
				}
			},
		/*
		* @phat:		Directory handle where write file
		* @file:		name of the file with extension (name.ext)
		* @codefile: callback must return the formatted data to save if null or undefined the buf will be saved 
		* @buf: raw buffer with the data to save
		* @create: true will create the path if doesn't exist 
		*/
		writeFile : function(phat,file,codefile,buf,create){
			phat.getFile(file,{create: true, exclusive: true}, function(fileEntry) {
				// Create a FileWriter object for our FileEntry 
				fileEntry.createWriter(function(fileWriter) {
					fileWriter.onwriteend = function(e) {
						console.log('Write completed.');
						};
					fileWriter.onerror = function(e) {
						console.log('Write failed: ' + e.toString());
						ManageFilesErrors(e);
						};
					// Create a new Blob and write it to log.txt.
					if (codefile!=undefined) {
						buf = codefile(buf);
						}
					var blob = new Blob([JSON.stringify(buf)], {type: 'text/plain'});
					fileWriter.write(blob); 
					},ManageFilesErrors);
				},ManageFilesErrors);
			},
		/*
		* @path:	path and file name dos format (\dir\dir\nome.ext) 
		* @create: true will create the path if doesn't exist 
		* @opFunc: write/read file callback  
		* @codefile: callback must return the formatted data to save if null or undefined the buf will be saved 
		* @buf: raw buffer with the data to save
		*/
		createDir : function(path,create,opFunc,codefile,buf){
			var pat=path.split('/'),
				cnt=0,
				that=this;
			var getDir = function(FSroot){
				FSroot.getDirectory(pat[cnt], {create: create}, function(root) {
					cnt++;
					that.actPath=root;
					if (cnt<(pat.length-1)) {
						console.log('Path: ' + cnt);
						getDir(root);
						} else if (writeFunc!=undefined) {
						console.log('lancio: ' + cnt);
						opFunc(root,pat[pat.length-1],codefile,buf,create);	
						}
					},ManageFilesErrors); 
				}
			if (pat.length>1) {
				getDir(this.fs.root);
				}
			},
		/*
		* @phat:		Directory handle where read file
		* @file:		name of the file with extension (name.ext)
		* @codefile: callback must return the formatted data to save if null or undefined the buf will be saved 
		* @buf: 		unused
		* @create: 		unused
		*/
		readFile : function(phat,filename,codefile,buf,create){
			if (create!=undefined) {
				phat.getFile(filename, {create: false}, function(fileEntry) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function(e) {
							codefile(JSON.parse(this.result));
							};
						reader.readAsText(file);
						}, ManageFilesErrors);
					}, ManageFilesErrors);
				}
			},
		/*
		* @path:	path and file name dos format (\dir\dir\nome.ext) 
		* @codefile: callback che ritorna i dati da leggere
		*/
		FileLoad : function(path,codeFile){
			try{
				if (FS!==null && typeof path==='string' && codeFile!=undefined) {
					this.createDir(path,false,this.readFile,codeFile,null);
					} 
				return true;
				}
			catch(e){
				console.log('errore File System FileLoad: '+e.message);
				}
			return false;
			},
		/*
		* @path:	path and file name dos format (\dir\dir\nome.ext) 
		* @codefile: callback must return the formatted data to save if null or undefined the buf will be saved 
		* @buf: raw buffer with the data to save
		* @create: true will create the path if doesn't exist 
		*/
		FileSave : function(path,codeFile,buf,create){
			try{
				if (FS!==null) {
					this.createDir(path,create,this.writeFile,codeFile,buf);
					} 
				return true;
				}
			catch(e){
				console.log('error File System FileSave: '+e.message);
				}
			return false;
			},
		}; //************** End LocalFile Object
	obj.fs={ //***************( Level 1 opened )*********
	init: function(libs){
		try{
			if (typeof libs==='object') {
				if (FS===null) {
					FS= new LocalFile(libs);
					} else console.log('error File System init: File System already initialized');
				return FS;
				}
			console.log('error File System init: Wrong Parameters');
			}
		catch(e){
			console.log('error File System init: '+e.message);
			}
		},
	 getFileDescriptor: function(){
		if (FS!==null) {
			return FS;
			}
		console.log('error LocalFile getFileDescriptor: Must run the initialization for first');
		return null;
		}
	};//***************( Level 1 closed )*********
})(this);//***************( Level 0 closed )*********


