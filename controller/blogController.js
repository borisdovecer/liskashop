var express = require('express');
var router = express.Router();
var moment = require('moment');
var cookieParser = require('cookie-parser');
var ObjectId = require('mongodb').ObjectId;
var Blog = require('../db/blogModel');
var Comment = require('../db/commentModel');

var app = express();
app.use(cookieParser());

var count = 0;
Blog.find({}, function (err, res) {
    count = res.length;
});


// Display list of all Blog.
module.exports.blog_list = function(req, res) {

    var user = req.user;
    var current = 1;
    var limit = 6;
    var pages = parseInt((count / limit) + 0.9);

    Blog.find( {}, function(err, result) {
        if (err) {
            res.render('backend/blog', {
                title: 'Blog List',
                data: ''
            })
        } else {
            res.render('bloglist', {
                title: 'Blog List',
                data: result,
                user: user,
                moment: moment,
                current: current,
                pages: pages,
            })
        }
    }).limit(limit).sort({"_id": -1})

};

// Display detail page for a specific Blog.
module.exports.blog_detail = function(req, res) {
    var user = req.user;
    var o_id = new ObjectId(req.params.id);




    Blog.find({"_id": o_id}, function(err, result) {
        if (err) {
            res.render('backend/updateitem', {
                title: 'item List',
                data: ''
            })
        } else {
            Comment.find({"blogId": o_id}, function (err, ress) {
                console.log(ress);
                res.render('blogsingle', {
                    title: 'items List',
                    user: user,
                    moment: moment,
                    data: result,
                    coms: ress
                })
            });
        }
    })

};

// Display detail page for a specific Blog.
module.exports.blog_list_get = function(req, res) {
    var user = req.user.username;
    Blog.find( {}, function(err, result) {
        res.render('backend/bloglist', {
            title: 'Blog list admin',
            data: result,
            moment: moment,
            user: req.user
        })
    });

};

// Display detail page for a specific Blog.
module.exports.blog_create_get = function(req, res) {
    res.render('backend/createblog', {
        title: 'Add New Blog',
        user: req.user.username,
        name: '',
        price: '',
        description: '',
        image: '',
        gallery:'',
        category:''
    })

};

// Handle Item create on POST. back
exports.blog_create_post = function(req, res) {
    var today = new Date();
    var img = req.files.img;

    var blog = {
        title: req.body.title,
        description: req.body.description,
        content_text:req.body.content_text,
        image: img.name,
        authorID: req.body.authorid
    };

    Blog.findOne({
        title: blog.title
    }, function (err, doc) {
        if (err) {
            res.status(500).send('error occured')
        } else {
            if (doc) {
                res.status(500).send('Blog already exists')
            } else {
                img.mv("public/images/slike/blog/" + img.name, function (err) {
                    if (err)
                        return res.status(500).send(err);


                });


                var record = new Blog();
                record.title = blog.title;
                record.description = blog.description;
                record.content_text = blog.content_text;
                record.image = blog.image;
                record.authorID = blog.authorID;
                record.createdOn = today;


                record.save(function (err, items) {
                    if (err) {
                        res.status(500).send('db error')
                    } else {
                        res.redirect('/admin')
                    }
                })

            }
        }
    })
};



// Display Blog update form on GET. back
exports.blog_update_get = function(req, res) {
    var o_id = new ObjectId(req.params.id);
    Blog.find({ "_id": o_id  },function(err, result) {
        res.render('backend/updateblog', {
            title: 'Update blog',
            data: result,
            user: req.user
        })
    });
};

// Handle blog update on POST. back
exports.blog_update_post = function(req, res) {
    var o_id = new ObjectId(req.body.id);
    var blog = {
        title: req.body.title,
        description: req.body.description,
        content_text:req.body.content_text,
        image: req.body.img,
        authorID: req.body.authorid
    };

    req.db.collection('blogs').update(
        { "_id": o_id  },
        { $set : blog },
        {multi: true, upsert: true }
    );
    res.redirect('/admin/blog');

};

// Handle Item delete on POST.
exports.blog_delete_post = function(req, res) {
    var o_id = new ObjectId(req.params.id);
    Blog.remove({"_id": o_id}, function(err, result) {
        res.redirect('/admin/blog')
    })
};

// Display Blog update form on GET. back
exports.comment_list_get = function(req, res) {

    Comment.find({ },function(err, result) {
        console.log(result);
        res.render('backend/commentlist', {
            title: 'Comment list',
            data: result,
            user: req.user
        })
    });
};

// Display Blog update form on GET. back
exports.comment_update = function(req, res) {
    var o_id = new ObjectId(req.params.id);
    var status = req.body.status;

    req.db.collection('comments').update({"_id": o_id},{ $set: { status: status}});
    res.redirect('/admin/comments');
};

// Post a comment
exports.comment_post = function(req, res) {
    var today = new Date();

    var com = {
        blogId: req.body.bid,
        name: req.body.name,
        email: req.body.email,
        comText:req.body.comText,
    };

    var record = new Comment();
    record.blogId = com.blogId;
    record.username = com.name;
    record.email = com.email;
    record.comText = com.comText;
    record.status = 'on moderation';
    record.createdOn = today;


    record.save(function (err, coms) {
        if (err) {
            res.status(500).send('db error')
        } else {
            res.redirect('/blog/' + com.blogId)
        }
    });


};




// Handle Item update on POST. back
exports.blog_upload_post = function(req, res) {
    var img = req.files.img;
    console.log("jooj ;" + img);
    img.mv("public/images/users/" + img.name, function (err) {
        if (err)
            return res.status(500).send(err);


    });



};