const mongoose = require('mongoose');
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl);
const util = require('util');
client.get = util.promisify(client.get);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function () {
    this.useCache = true;

}


mongoose.Query.prototype.exec = async function () {
    // console.log("I am about to run a query");
    if(!this.useCache){
        console.log("I am not controlling cache");
        return exec.apply(this,arguments)
    }
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));
    const cacheValue = await client.get(key);
    if (cacheValue) {
        console.log("Serving from cache")
        const doc = JSON.parse(cacheValue);
        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc)
    }




    const result = await exec.apply(this, arguments)
    console.log("Serving from mongodb")
    client.set(key, JSON.stringify(result));

    return result
}

