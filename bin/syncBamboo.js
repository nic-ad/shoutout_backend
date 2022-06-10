#!/usr/bin/env node
/**
 * Main entrypoint for Harvest -> Twinfield sync
 */
require('dotenv').config()
const _ = require('underscore')
const axios = require('axios').default;
const mongoose = require("mongoose");
const BAMBOO_API_KEY = process.env.BAMBOO_API_KEY;
const { Person } = require("../models");

// Bamboo is returning a location in the format of two letter country code - State / City.
// For example US - Maine. We are jus going to grab the two or three letter country code for now.
function getCountryFromString(location) {
  if (!location || location.indexOf(' - ') === -1) {
    return 'NA'
  }

  return location.split(' - ')[0]
}

async function getUser() {
  try {
    console.log('Fetching users from bamboo...')
    const response = await axios.get('https://api.bamboohr.com/api/gateway.php/dept/v1/employees/directory',
    { 
      auth: {
        password: 'x',
        username: BAMBOO_API_KEY
      },
       headers: {
        'content-type': 'application/json',
        'Accept': 'application/json'
       }
    });
    const employees = response.data.employees
    let filter, update;

    console.log('Updating users in mongo...')
    for(let i=0;i<employees.length; i++) {
      filter = { email: employees[i].workEmail };
      update = {
        employeeId: employees[i].id,
        email: employees[i].workEmail,
        name: employees[i].displayName,
        team: employees[i].division,
        country: getCountryFromString(employees[i].location)
      }
      await Person.findOneAndUpdate(filter, update, { upsert: true });
    }
    console.log('Finished updating users.')
    process.exit(1)
  } catch (error) {
    console.error(error);
    process.exit(1)
  }

}

mongoose.connect(process.env.MONGO_URI);
getUser()
