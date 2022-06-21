const express = require('express');
const mongoose = require('mongoose');
const {Person, Message} = require('../models');
const {mapShoutoutData, handleApiError} = require('./utils');

const router = express.Router();

router.get('/search', async function(request, response){
  try{
    const emailSearch = request.query.email;
    const nameSearch = request.query.name;
    let people = [];
    let queryConditions = [];

    if(emailSearch){
      queryConditions.push({email: {$regex: `${emailSearch.toLowerCase()}`}});
    }

    if(nameSearch){
      queryConditions.push({name: {$regex: `${nameSearch.toLowerCase()}`, $options: 'i'}});
    }

    if(!queryConditions.length){
      const body = {error: 'Bad Request (Valid \'name\' or \'email\' Param Required)'};
      response.status(400).send(body);
    }

    people = await Person.find({$or: queryConditions});
    response.send(people);
  }
  catch(error){
    handleApiError(error, response);
  }
});

router.get('/:id', async function(request, response){
  try{
    const id = mongoose.Types.ObjectId(request.params.id);

    const shoutoutsGiven = await Message.aggregate([
      {
        $match: {author: id}
      },
      ...mapShoutoutData
    ]);

    const shoutoutsReceived = await Message.aggregate([
      ...mapShoutoutData,
      {
        //filter to return only those shoutouts that contain this person's id; 
        //$addFields allows us to retain the other fields in the Message model ($project would require explicitly listing each one to retain)
        $addFields: {
          recipients: {
            $filter: {
              input: '$recipients',
              as: 'recipient',
              cond: {$eq: ['$$recipient._id', id]}
            }
          }
        }
      },
      //if after above processing the shoutout has no recipients, we of course know this person wasn't a recipient so remove from results
      {
        $match: {recipients: {$ne: []}}
      }
    ]);

    const person = await Person.findById(id) ?? {};
    
    response.send({
      userInfo: person,
      shoutoutsGiven,
      shoutoutsReceived
    });
  }
  catch(error){
    handleApiError(error, response);
  }
});

module.exports = router;
