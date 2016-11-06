ga('create', 'UA-12345678-1', 'auto');
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