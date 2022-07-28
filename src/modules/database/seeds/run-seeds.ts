#!/usr/bin/env node
/**
 * Main entrypoint for Harvest -> Twinfield sync
 */
import axios from 'axios';
import { Person } from '../person/person.entity';
import * as dotenv from 'dotenv';
import dataSourceInstance from '../migration-config';
const result = dotenv.config({ path: '.env' });
if (result.error) {
  //TODO: Handle error
}
const BAMBOO_API_KEY = process.env.BAMBOO_API_KEY;

// Bamboo is returning a location in the format of two letter country code - State / City.
// For example US - Maine. We are jus going to grab the two or three letter country code for now.
function getCountryFromString(location) {
  if (!location || !location.includes(' - ')) {
    return 'NA';
  }

  return location.split(' - ')[0];
}

const getUser = async () => {
  dataSourceInstance
    .initialize()
    .then(() => {
      console.log('run-seeds: dataSource initialized');
    })
    .catch((err) => {
      console.error('errror', err);
    });
  try {
    console.log('Fetching users from bamboo...');
    const response = await axios.get(
      'https://api.bamboohr.com/api/gateway.php/dept/v1/employees/directory',
      {
        auth: {
          password: 'x',
          username: BAMBOO_API_KEY,
        },
        headers: {
          'content-type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
    const employees = response.data.employees;

    const filterUnwanted = (employees) => {
      const required = employees.filter((emp) => {
        return emp.workEmail && emp.id;
      });
      return required;
    };

    const filteredEmployees = await filterUnwanted(employees);

    const update = filteredEmployees.map((emp) => {
      return {
        employeeId: emp.id,
        email: emp.workEmail,
        name: emp.displayName,
        team: emp.division,
        country: getCountryFromString(emp.location),
      };
    });

    const UserRepository = dataSourceInstance.getRepository(Person);
    await UserRepository.save(update);

    console.log('Finished updating users.');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

getUser();
