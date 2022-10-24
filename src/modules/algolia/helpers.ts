export const modifyProfileData = ({ skills, ...rest }) => {
  return {
    ...rest,
    languages: skills.filter(({ type }) => type === 'language'),
    platforms: skills.filter(({ type }) => type === 'platform'),
  };
};
