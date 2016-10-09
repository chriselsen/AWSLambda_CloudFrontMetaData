# CloudFrontMetaData
A simple AWS Lambda (http://aws.amazon.com/lambda) function that in combination with Amazon API Gateway (https://aws.amazon.com/api-gateway/) can extract meta data (IP Version, HTTP Version, and AWS CloudFront Edge Location) from visitor requests, when placed behind CloudFront.

## Setup
To run this skill you need to do two things. The first is to deploy the code in lambda, and the second is to configure API Gateway.

### AWS Lambda Setup
1. Go to the AWS Console and click on the Lambda link. Note: ensure you are in us-east or you won't be able to use Alexa with Lambda.
2. Click on the Create a Lambda Function or Get Started Now button.
3. Name the Lambda Function “CloudFrontMetaData”.
4. Go to the the src directory, select all files and then create a zip file, make sure the zip file does not contain the src directory itself, otherwise Lambda function will not work.
5. Upload the .zip file to the Lambda
6. Keep the Handler as index.handler (this refers to the main js file in the zip).
7. Create a basic execution role and click create.

### API Gateway Setup
1. 

## Usage
When visiting the API Gateway URL via CloudFront you will see the following output:

```
ipver=IPv4
httpver=2.0
edgeloc=sfo
```

You can now use the following Javascript code for Google Analytics to push the information into Google Analytics as custom dimension for each visit:

```javascript
ga('create', 'UA-39076327-3', 'auto');
	function processData(x) {
		var y = {};
		for (var i = 0; i < x.length-1; i++) {
			var split = x[i].split('=');
			y[split[0].trim()] = split[1].trim();
		} 
		return y;
	} 

	function objData(x) { 
		return obj[x]; 
	} 

	var data;
	var obj;
	var client = new XMLHttpRequest();
	client.open("GET", "/ipver.php", false);
	client.onreadystatechange =
		function () {
			if(client.readyState === 4){
				if(client.status === 200 || client.status == 0){
					data = client.responseText.split("\n");
				}
			}
		};
	client.send(null);
	obj= processData(data);

	__gaTracker('set','dimension1',objData('edgeloc'));
	__gaTracker('set','dimension2',objData('ipver'));
	__gaTracker('set','dimension3',objData('httpver'));
	
  	ga('send', 'pageview');
```

