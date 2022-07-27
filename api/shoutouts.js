const express = require('express');
const { Message } = require('../models');
const { mapShoutoutData, handleApiError } = require('./utils');
const { latestShoutoutsLimit } = require('../utils/constants');

const router = express.Router();

router.get('/latest', async function (request, response) {
  try {
    const shoutouts = await Message.aggregate([
      ...mapShoutoutData,
      {
        $sort: { _id: -1 },
      },
      {
        $limit: latestShoutoutsLimit,
      },
    ]);

    response.send(shoutouts);
  } catch (error) {
    handleApiError(error, response);
  }
});

router.get('/by-year', async function (request, response) {
  try {
    const requestedYear = Number(request.query.year);
    let shoutouts;

    if (requestedYear) {
      shoutouts = await Message.aggregate([
        ...mapShoutoutData,
        {
          $match: { year: requestedYear },
        },
      ]);
    }
    //get all shoutouts for past 12 months (default)
    else {
      const now = new Date();
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(now.getMonth() - 12);

      //console.log(`12 months ago: ${twelveMonthsAgo.toLocaleDateString()}`);

      shoutouts = await Message.aggregate([
        ...mapShoutoutData,
        {
          $addFields: {
            inPastTwelveMonths: { $gte: ['$createDate', twelveMonthsAgo] },
          },
        },
        {
          $match: { inPastTwelveMonths: { $eq: true } },
        },
      ]);
    }

    response.send(shoutouts);
  } catch (error) {
    handleApiError(error, response);
  }
});

module.exports = router;
