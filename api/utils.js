//mongo aggregation pipeline that converts Person and Message refs to their actual objects and adds useful fields to the response
const mapShoutoutData = [
  {
    //$lookup each author in message by its _id to get actual corresponding person object from 'people' collection
    $lookup: {
      from: 'people',
      localField: 'author',
      foreignField: '_id',
      as: 'author',
    },
  },
  {
    //convert single-element array generated from 'as' in $lookup to object
    $unwind: {
      path: '$author',
    },
  },
  {
    //$lookup each recipient in message by its _id to get actual corresponding person object form 'people' collection
    $lookup: {
      from: 'people',
      localField: 'recipients',
      foreignField: '_id',
      as: 'recipients',
    },
  },
  {
    $addFields: {
      month: { $month: '$createDate' },
      year: { $year: '$createDate' },
    },
  },
];

function handleApiError(error, response, statusCode) {
  console.error(error);
  const body = { error: error.message || 'Unexpected Error' };
  response.status(statusCode || 500).send(body);
}

module.exports = { mapShoutoutData, handleApiError };
