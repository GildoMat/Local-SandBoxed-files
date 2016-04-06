# Local-SandBoxed-files
javascript lib for easy handle the HTML5 File Api

It is a good way to save data during the session job. 
When you will close the app the files and the directories will be deleted. All the procedures are asynchronous, for this reason you cannot know when the file operation will exactly executed. For this reason the data must be persistent, or created when is required or passed like argument to the write procedure.

## Getting Started

include the lib in your html file:
```html
	<script type="text/javascript" src="js/locFile.js" async='true' defer='true'></script>
```
	
first thing make init the library:
```js
  	...
  	...
  	var FS = fs.init(null); 
		FS.Open(2*1024*1024*1024); 	//number of bytes to create a SandBoxed disc
	                           		//remember that when you close the page the disc will be deleted
```

save text or obj on file :
```js
  	...
  	...
  	var data = {
      		len: 3,
      		names:[
        		'john',
        		'robert',
        		'jane']};
      
   	var FS = fs.getFileDescriptor();
		FS.FileSave('machine/robot/track/myfile.klm',null,data,true);
```	
	
and read the file:

```js
  	var data = null;
  	var FS = fs.getFileDescriptor();
  	FS.FileLoad('machine/robot/track/myfile.klm',function(dt){data = dt;});
```

it is also possible transform data before the saving process:

```js
  	...
  	...
  	var data = {
      		len: 3,
      		names:[
        		'john',
        		'robert',
        		'jane']};
    
  	var getData = function(dt){
    		return data;
    		};    
  	var FS = fs.getFileDescriptor();
  	FS.FileSave('machine/robot/track/myfile.klm',getData,null,true);
```


 
