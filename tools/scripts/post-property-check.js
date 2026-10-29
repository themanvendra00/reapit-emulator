const ENV = {
  development: 'development',
  production: 'production',
};

const CURRENT_ENV = ENV.development;

const BASE_URL =
  CURRENT_ENV === ENV.development
    ? 'http://localhost:3002'
    : 'http://13.203.97.0:3001';

const propertyIds = [
  'HEO260703',
  'HEO260705',
  'DUB260701',
  'DUB260702',
  'DUB260703',
  'HEO260704',
  'HEO260701',
  'HEO260702',
];


const checks = [
  {
    description: 'Confirmation of Instruction',
    type: 'preInstruction',
    status: 'completed',
  },
  {
    description: 'Sign Terms & Conditions',
    type: 'preInstruction',
    status: 'needed',
  },
  {
    description: 'Proof of ID & Address',
    type: 'preInstruction',
    status: 'needed',
  },
  {
    description: 'Prepaid Advertising',
    type: 'preInstruction',
    status: 'needed',
  },
  {
    description: 'BER Rating Certificate',
    type: 'preInstruction',
    status: 'needed',
  },
  {
    description: 'BER Advisory Report',
    type: 'preInstruction',
    status: 'needed',
  },
  {
    description: 'Property Description',
    type: 'preInstruction',
    status: 'needed',
  },
  {
    description: 'Photos & Videos',
    type: 'preInstruction',
    status: 'needed',
  },
  {
    description: 'Solicitor Details',
    type: 'preInstruction',
    status: 'needed',
  },
  {
    description: 'Service Charges',
    type: 'preInstruction',
    status: 'needed',
  },
  {
    description: 'Rents & Yields',
    type: 'preInstruction',
    status: 'needed',
  },
  {
    description: 'Certificates & Documents',
    type: 'preInstruction',
    status: 'needed',
  },
];

async function createChecks() {
  for (const propertyId of propertyIds) {
    for (const check of checks) {
      try {
        const response = await fetch(
          `${BASE_URL}/properties/${propertyId}/checks`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(check),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(`❌ Failed: ${check.description} for ${propertyId}`);
          console.error(data);
          continue;
        }

        console.log(`✅ Created: ${check.description} for ${propertyId}`);
        console.log(data);
      } catch (error) {
        console.error(`❌ Error: ${check.description} for ${propertyId}`);
        console.error(error.message);
      }
    }
  }
}

createChecks();
