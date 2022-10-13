import userSkills from './seed.file';
import { Skills } from '../../skills/skills.entity';
import { Person } from '../../person/person.entity';
import dataSourceInstance from '../../migration-config';

const seedSkills = async () => {
  try {
    await dataSourceInstance.initialize();
    console.log('dataSource initialized...');
    const skillsRepository = dataSourceInstance.getRepository(Skills);
    const personRepository = dataSourceInstance.getRepository(Person);
    const people = await personRepository.count();

    if(!people){
      console.error(`The person table is empty.  Please run "npm run seed:users" before running this script so that skills can be added to an initial set of people.`);
      process.exit(1);
    }

    for (let i = 0; i < userSkills.length; i++) {
      const user = userSkills[i];
      const person = await personRepository.findBy({ email: user.email });
      //arrays of skill ids to set for each seed user
      const languageSkillIdsToSet = [];
      const platformSkillIdsToSet = [];

      if(!person){
        console.error(`Skipping skills seeding for ${user.email} (not found in person table)...`);
      }

      const handleSkill = async function(skill, skillIdArray){
        //check if skill alreayd in skills table
        let savedSkill = await skillsRepository.findOneBy(skill);

        if(!savedSkill){
          //insert if not
          savedSkill = await skillsRepository.save(skill);
        }

        //push its id to the list of skill ids for this type
        skillIdArray.push(savedSkill.id);
      };

      for (let j = 0; j < user.languages.length; j++) {
       await handleSkill({ name: user.languages[j], type: 'language' }, languageSkillIdsToSet);
      }

      for (let l = 0; l < user.platforms.length; l++) {
        await handleSkill({ name: user.platforms[l], type: 'platform' }, platformSkillIdsToSet);
      }

      //populate skills column with the skill ids for this user
      await personRepository.update({ email: user.email }, { skillIds: [...languageSkillIdsToSet, ...platformSkillIdsToSet]});
    }
    
    console.log('skills successfully seeded');
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedSkills();