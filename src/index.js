
exports.handler = (event, context, callback) => {
    var dns = require('dns');
    var wait = require('wait.for');
    var output = "";

    var ipArray = event.headers["X-Forwarded-For"].split(",");
    output += "ipver=" + (ipArray[0].indexOf(":") > -1 ? 'IPv6' : 'IPv4');
    output += require('os').EOL;

    var viaArray = event.headers["Via"].split(" ");
    output += "httpver=" + viaArray[0].replace('https/','');
    output += require('os').EOL;

    function DNSLookup(){
        loc = wait.for(dns.reverse, (ipArray[1].trim()));
        output += "edgeloc=" + (loc[0].split("."))[1].substring(0, 3);
        callback(null, output);
    }

    wait.launchFiber(DNSLookup);
    
};
