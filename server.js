const { parse } = require('path');

let newId = -1;
const http = require( 'http' ),
      fs   = require( 'fs' ),
      // IMPORTANT: you must run `npm install` in the directory for this assignment
      // to install the mime library if you're testing this on your local machine.
      // However, Glitch will install it automatically by looking in your package.json
      // file.
      mime = require( 'mime' ),
      dir  = 'public/',
      port = 3000

let appdata = []


const server = http.createServer( function( request,response ) {
  if( request.method === 'GET' ) {
    handleGet( request, response )    
  }else if( request.method === 'POST' ){
    handlePost( request, response ) 
  }else if (request.method === 'DELETE'){
    handleDelete(request, response)
  }else if (request.method === 'PUT'){
    handlePut(request, response)
  }

})

const handleGet = function( request, response ) {
  const filename = dir + request.url.slice( 1 ) 

  if( request.url === '/' ) {
    sendFile( response, 'public/index.html' )
  }else{
    sendFile( response, filename )
  }
}

const handlePost = function( request, response ) {
  let dataString = ''

  request.on( 'data', function( data ) {
      dataString += data 
  })

  request.on( 'end', function() {
    const data = JSON.parse( dataString )
    let newTotal = (data.cost * (1 + parseFloat(data.tax)));
    newTotal = newTotal.toFixed(2);
    console.log(data);
    if (data.tag === -1){
      console.log(data.cost);
      data.total = newTotal;
      data.tag = appdata.length;
      newTotal = 0;
      appdata.push(data);
    } else {
      appdata = appdata.map(item => {
        if (item.tag === data.tag){
          item.item = data.item;
          item.description = data.description;
          item.cost = data.cost;
          item.tax = data.tax;
          item.total = newTotal;
          console.log('Text:', item.total);
        }
        newTotal = 0;
        return item;
      });
    }
    
    //data.total = data.cost * (1 + data.tax);
    //appdata.push(data);
    //console.log(appdata);
    // ... do something with the data here!!!
    
    

    
    
    // ... and then add it to appdata

    response.writeHead( 200, "OK", {'Content-Type': 'text/plain' })
    response.end( JSON.stringify( appdata ) )
    //}
  })
}
const handleDelete = function(request, response) {
  let dataString = '';
  request.on('data', function(data) {
    dataString += data;
  });
  request.on('end', function() {
    const data = JSON.parse(dataString);
    const tagToDelete = Number(data.tag);
    appdata = appdata.filter(item => item.tag !== tagToDelete);
    console.log(appdata);
    response.writeHead(200, "OK", {'Content-Type': 'text/plain'});
    response.end(JSON.stringify(appdata));
  });
};

const handlePut = function(request, response){
  let dataString = ''
  request.on('data', function(data){
    dataString += data
  })
  request.on('end', function(){
    const data = JSON.parse(dataString)
    appdata = appdata.map(item => {
      if(item.tag === data.tag){
        return data
      }
      return item
    })
    response.writeHead(200, "OK", {'Content-Type': 'text/plain'})
    response.end(JSON.stringify(appdata))
  })
}

const sendFile = function( response, filename ) {
   const type = mime.getType( filename ) 

   fs.readFile( filename, function( err, content ) {

     // if the error = null, then we've loaded the file successfully
     if( err === null ) {

       // status code: https://httpstatuses.com
       response.writeHeader( 200, { 'Content-Type': type })
       response.end( content )

     }else{

       // file not found, error code 404
       response.writeHeader( 404 )
       response.end( '404 Error: File Not Found' )

     }
   })
}

server.listen( process.env.PORT || port )