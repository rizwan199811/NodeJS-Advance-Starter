const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const {clearHash} =require('../services/cache')

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const redis = require('redis');
    const redisUrl = 'redis://127.0.0.1:6379'
    const client = redis.createClient(redisUrl);
    const util = require('util');
    client.get = util.promisify(client.get);

    const cachedBlogs = await client.get(req.user.id)
    //Do we have any cached data in redis related to this query

    //If yes,then respond to the  request right away and return

    //If no, we need to respond to request and update or cache to store the data
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    // const redis = require('redis');
    // const redisUrl = 'redis://127.0.0.1:6379'
    // const client = redis.createClient(redisUrl);
    // const util = require('util');
    // client.get = util.promisify(client.get);
     
    const blogs = await Blog.find({ _user: req.user.id,title:'Rizwan ' }).cache()
    // console.log(req.user.id)
    // console.log("SERVING FROM MONGODB");
    // console.log(blogs);
    res.send(blogs)
    // client.set(req.user.id,JSON.stringify(blogs))
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
    clearHash(req.user.id)
  });
};
