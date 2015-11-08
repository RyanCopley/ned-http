'use strict';

const http = require("request");
module.exports = http;

const spies = [];

module.exports.addSpy = function (spyCB){
    spies.push(spyCB);
};

const get = http.get;
module.exports.get = function(url, cb){
    return inject(get(url, cb));
}

const head = http.head;
module.exports.head = function(url){
    return inject(head(url, cb));
}

const post = http.post;
module.exports.post = function(url){
    return inject(post(url, cb));
}

const put = http.put;
module.exports.put = function(url){
    return inject(put(url, cb));
}

const patch = http.patch;
module.exports.patch = function(url){
    return inject(patch(url, cb));
}

const del = http.del;
module.exports.del = function(url){
    return inject(del(url, cb));
}

function inject(req){
    req.startedOn = new Date();
    req.errored = false;
    req.on("response", function (resp){
        const completedOn = new Date();
        req.firstByteTime = completedOn - this.startedOn;
    });
    req.on("error", function (resp){
        req.errored = true;
    });
    req.on("end", function(){
        const completedOn = new Date();
        req.completionTime = completedOn - this.startedOn;
        for (let spyID in spies){
            const spy = spies[spyID];
            spy(req);
        }
    });
    return req;
}
