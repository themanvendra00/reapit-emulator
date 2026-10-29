const BASE_URL = 'http://13.203.97.0:3001';
const propertyId = 'HEO260703';

const checkIds = [
  'CHE354599',
  'CHE757061',
  'CHE655121',
  'CHE973526',
  'CHE738967',
  'CHE955030',
  'CHE243168',
  'CHE611867',
  'CHE928751',
  'CHE161587',
  'CHE370480',
  'CHE545473',
];

async function deleteChecks() {
  for (const checkId of checkIds) {
    const url = `${BASE_URL}/properties/${propertyId}/checks/${checkId}`;

    try {
      const response = await fetch(url, { method: 'DELETE' });
      const responseBody = await response.text();

      if (!response.ok) {
        console.error(`❌ Failed to delete check ${checkId} for ${propertyId}`);
        console.error(
          `HTTP ${response.status}: ${responseBody || response.statusText}`,
        );
        process.exitCode = 1;
        continue;
      }

      console.log(`✅ Deleted check ${checkId} for ${propertyId}`);

      if (responseBody) {
        console.log(responseBody);
      }
    } catch (error) {
      console.error(`❌ Error deleting check ${checkId} for ${propertyId}`);
      console.error(error.message);
      process.exitCode = 1;
    }
  }

  console.log('\nFinished processing all check IDs.');
}

deleteChecks();
