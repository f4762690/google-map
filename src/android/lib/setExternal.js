window.promises = {};
var myUUID = 1;
function generateUUID() {
    var uuid = "UUID" + myUUID;
	myUUID++;
    return uuid;
}

function resolvePromise(promiseId, data, error)
{
    if (error){
      window.promises[promiseId].reject(error);
    } else{
      window.promises[promiseId].resolve(data);
    }

    delete window.promises[promiseId];
}

window.external = {};
window.external.resolvePromise = resolvePromise;
window.external.SaveGPX = SaveGPX;
window.external.importFile = importFile;
window.external.SetConfig = SetConfig;
window.external.GetConfig = GetConfig;
window.external.SimulateLocationTo = SimulateLocationTo;
window.external.StopSimulation = StopSimulation;
window.external.NewWindow = NewWindow;
window.external.arrived = Arrived;
window.external.copyText = copyText;
window.external.getMessage = getPushMessage;

function SaveGPX(result,filename)
{
	window.androidexternal.SaveGPX(result,filename);
}

function importFile(type,call)
{
    console.log("importFile", call);

    var promise = new Promise(function(resolve, reject) {
        var promiseId = generateUUID();
        window.promises[promiseId] = { resolve, reject};
        try {
			window.androidexternal.importFile(type,promiseId);
        }
        catch(exception) {
            alert(exception);
        }
    });

    promise.then(function(val) {
        if(val.length == 0)
        {
            call("");
        }else{
            try {
                var obj = JSON.parse(val);
                call(obj);
            } catch(err) {
            }
        }
    }, function(err) {
    });
}

function SetConfig(key,val)
{
	window.androidexternal.SetConfig(key,val);
}

function GetConfig(key,call)
{
    var promise = new Promise(function(resolve, reject) {
        var promiseId = generateUUID();
        window.promises[promiseId] = { resolve, reject};
        try {
			window.androidexternal.GetConfig(key,promiseId);
        }
        catch(exception) {
            alert(exception);
        }
    });

    promise.then(function(val) {
        call(val);
    }, function(err) {
    });
}

function SimulateLocationTo(lat, lng)
{
   window.androidexternal.SimulateLocationTo(lat,lng);
}

function StopSimulation()
{
	window.androidexternal.StopSimulation();
}

function NewWindow(url)
{
	window.androidexternal.NewWindow(url);
}

function Arrived()
{
	window.androidexternal.Arrived();
}

function copyText(txt)
{
	window.androidexternal.copyText(txt);
}

function getPushMessage(stringData, call)
{
    var promise = new Promise(function(resolve, reject) {
        var promiseId = generateUUID();
        window.promises[promiseId] = { resolve, reject};
        try {
			window.androidexternal.getPushMessage(stringData,promiseId);
        }
        catch(exception) {
            alert(exception);
        }
    })

    promise.then(function(val) {
        if(val.length == 0)
        {
            call("");
        }else{
            try {
                call(val);
            } catch(err) {
            }
        }
    }, function(err) {
    });
}

