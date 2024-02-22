const express = require('express');
const ip = require('ip');
const http = require('http');
const host = ip.address();
const port = process.env.PORT || 3000


module.exports = {
// Listen for requests for the endpoint "heart" with a query parameter "number"
start : () => {
    http.createServer((req, res) => {
        if (req.url.startsWith('/heart')) {
                const number = req.url.split('=')[1];
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`I love you ${number} times`);
            } else 
            {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Bonjour !!');
            }
                    }
    ).listen(port, host, () => {
        console.log(`Server running at http://${host}:${port}/`);
    });	
}		
}