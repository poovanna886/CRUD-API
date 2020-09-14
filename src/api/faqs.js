const express = require('express');

const router = express.Router();

const monk = require('monk');

//echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
const db = monk(process.env.MONGO_URI);

const Joi = require('@hapi/joi');

const faqs = db.get('faqs');

const schema = Joi.object({
  task: Joi.string().trim().required(),
  taskstatus: Joi.string().trim().required(),
})

// Read all faqs:
router.get('/' , async (req, res, next) => {
  try {
      const items = await faqs.find({});
      res.json(items);
  } catch (e) {
    next(e);
  }

/*  res.json({
    "message": "Hello"
  })*/
});

//Read one:
router.get('/:id', async (req, res, next) => {
 try {
    const { id } = req.params;
    const item = await faqs.findOne({
      _id: id,
    });

    if (!item) return next();
    return res.json(item);

  } catch (e) {
    next(e);
  }

});

//Create one:
router.post('/', async (req, res, next) => {
  try {
    console.log(req.body);
    const value = await schema.validateAsync(req.body);
    const inserted = await faqs.insert(value);
    res.json(inserted);
  } catch (e) {
      next(e);
  }
});

//Update one:
router.put('/:id', async (req,res,next) => {
  try {
    const { id } = req.params;
    //console.log(req.body);
    const value = await schema.validateAsync(req.body);
    const item = await faqs.findOne({
      _id: id,
    });

    if (!item) return next();
    const updated = await faqs.update({
      _id: id,
    },{
      $set: value,
    });
    return res.json(value);

  } catch (e) {
    next(e);
  }

});

//Delete one
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await faqs.remove({ _id: id });
    res.json({
      "message": "Success",
    });


  } catch (e) {
    next(e);
  }

});

module.exports = router;
