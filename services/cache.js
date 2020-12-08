const mongoose = require('mongoose');
const redis = require('redis');
const redisUrl = 'redis://127.0.0.1:6379'
const client = redis.createClient(redisUrl);
const util = require('util');
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options={}) {
    this.useCache = true;
    this.hashKey =JSON.stringify(options.key || '')
    return this;

}


mongoose.Query.prototype.exec = async function () {
    // console.log("I am about to run a query");

    if(!this.useCache){
        console.log("Serving from mongodb not cache");
        return exec.apply(this,arguments)
    }
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));
    console.log(key);
    const cacheValue = await client.hget(this.hashKey,key);
    if (cacheValue) {
        console.log("Serving from cache")
        const doc = JSON.parse(cacheValue);
        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc)
    }




    const result = await exec.apply(this, arguments)
    console.log("Serving from mongodb")
    client.hset(this.hashKey,key, JSON.stringify(result));

    return result
}

module.exports={
clearHash(hashKey){
    client.del(JSON.stringify(hashKey))
}
}
