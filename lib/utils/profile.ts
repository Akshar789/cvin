// Check if user profile is complete (has all required fields filled)
export function isProfileComplete(user: any): boolean {
  if (!user) return false;

  const requiredFields = [
    'fullName',
    'location',
    'targetJobDomain',
    'careerLevel',
    'industry',
    'yearsOfExperience',
    'educationLevel',
    'degreeLevel',
    'educationSpecialization',
    'mostRecentJobTitle',
    'mostRecentCompany',
    'employmentStatus',
  ];

  return requiredFields.every(field => {
    const value = user[field];
    return value && value.toString().trim() !== '';
  });
}

export function getMissingProfileFields(user: any): string[] {
  if (!user) return [];

  const requiredFields = [
    'fullName',
    'location',
    'targetJobDomain',
    'careerLevel',
    'industry',
    'yearsOfExperience',
    'educationLevel',
    'degreeLevel',
    'educationSpecialization',
    'mostRecentJobTitle',
    'mostRecentCompany',
    'employmentStatus',
  ];

  return requiredFields.filter(field => {
    const value = user[field];
    return !value || value.toString().trim() === '';
  });
}
