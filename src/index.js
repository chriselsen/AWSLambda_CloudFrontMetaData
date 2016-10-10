
exports.handler = (event, context, callback) => {
    var dns = require('dns');
    var wait = require('wait.for');
    var output = "";

	var xApiDomain = event.headers["x-api-domain"];
	if (!xApiDomain) { xApiDomain = 'unknown' }
	console.log("x-api-domain: ", xApiDomain);
	
    var ipArray = event.headers["X-Forwarded-For"].split(",");
    console.log("X-Forwarded-For: ", event.headers["X-Forwarded-For"]);
	ipVersion = (ipArray[0].indexOf(":") > -1 ? 'IPv6' : 'IPv4');
    output += "ipver=" + ipVersion;
    output += require('os').EOL;

    var viaArray = event.headers["Via"].split(" ");
	httpVersion = viaArray[0].replace('https/','')
    output += "httpver=" + httpVersion;
    output += require('os').EOL;

    function DNSLookup(){
        try {
			loc = wait.for(dns.reverse, (ipArray[1].trim()));
		} catch(err) {
			loc = [ 'unk.unk' ];
		}
        console.log("DNS: ", loc[0]);
		edgeLoc = (loc[0].split("."))[1].substring(0, 3);
        output += "edgeloc=" + edgeLoc;
		console.log("EdgeLoc: ", edgeLoc);
		
		putCloudWatch(xApiDomain, ipVersion, httpVersion, edgeLoc, callback);
		
        callback(null, output);
    }

    wait.launchFiber(DNSLookup);
    
};

function putCloudWatch(Domain, IPVersion, HTTPVersion, EdgeLoc, callback){
    var AWS = require('aws-sdk');
    AWS.config.region = 'us-west-2';
    var cloudwatch = new AWS.CloudWatch();
    
    var params = {
            MetricData: [
                {
                    MetricName: 'IP-Version', /* required */
                    Dimensions: [
                        {
                            Name: Domain, /* required */
                            Value: IPVersion /* required */
                        },
                    ],
                    Timestamp: + Math.floor(new Date() / 1000),
                    Unit: 'Count',
                    Value: 1.0 
                },
                {
                    MetricName: 'HTTP-Version', /* required */
                    Dimensions: [
                        {
                            Name: Domain, /* required */
                            Value: HTTPVersion /* required */
                        },
                    ],
                    Timestamp: + Math.floor(new Date() / 1000),
                    Unit: 'Count',
                    Value: 1.0
                },
				{
                    MetricName: 'Edge Location', /* required */
                    Dimensions: [
                        {
                            Name: Domain, /* required */
                            Value: EdgeLoc /* required */
                        },
                    ],
                    Timestamp: + Math.floor(new Date() / 1000),
                    Unit: 'Count',
                    Value: 1.0 
                }
            ],
            Namespace: 'CloudFrontStats' /* required */
        };
        
        cloudwatch.putMetricData(params, function(err, data) {});
}
