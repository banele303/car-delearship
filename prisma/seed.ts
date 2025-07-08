import { PrismaClient, Prisma, CarCondition, CarType, FuelType, Transmission, CarStatus, EmployeeRole, EmployeeStatus } from "@prisma/client";
import fs from "fs";
import path from "path";

// Helper function to convert string to PascalCase
function toPascalCase(str: string): string {
  return str
    .replace(/\w+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .replace(/\s+/g, '');
}

// Helper function to convert string to camelCase
function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

const prisma = new PrismaClient();

// Helper functions
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Sample data
const CITIES = ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Bloemfontein"];
const CAR_MAKES = ["Toyota", "Volkswagen", "Ford", "BMW", "Mercedes-Benz", "Audi", "Nissan", "Hyundai"];
const CAR_MODELS = [
  "Corolla", "Golf", "Ranger", "3 Series", "C-Class", "A4", "Qashqai", "Tucson",
  "Hilux", "Polo", "EcoSport", "X3", "GLC", "Q5", "X-Trail", "Creta"
];
const COLORS = ["Black", "White", "Silver", "Gray", "Blue", "Red", "Green"];
const FIRST_NAMES = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "James", "Emma"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"];

// Demo images from public directory
const CAR_IMAGES = [
  "/singlelisting-3.jpg",
  "/singlelisting-2.jpg",
  "/h3.jpg",
  "/hero-1.jpg",
  "/hero-2.jpg"
];

function generateRandomCar() {
  const year = getRandomInt(2018, 2023);
  const make = getRandomElement(CAR_MAKES);
  const model = getRandomElement(CAR_MODELS);
  const price = getRandomInt(150000, 800000);
  const mileage = getRandomInt(5000, 80000);
  const color = getRandomElement(COLORS);
  
  // Select 1-3 random images
  const photoCount = getRandomInt(1, 3);
  const photoUrls = [];
  for (let i = 0; i < photoCount; i++) {
    photoUrls.push(getRandomElement(CAR_IMAGES));
  }

  return {
    vin: `VIN${Date.now()}${getRandomInt(1000, 9999)}`,
    make,
    model,
    year,
    price,
    mileage,
    condition: getRandomElement([
      CarCondition.NEW,
      CarCondition.USED,
      CarCondition.CERTIFIED_PRE_OWNED
    ]),
    carType: getRandomElement([
      CarType.SEDAN,
      CarType.SUV,
      CarType.HATCHBACK,
      CarType.PICKUP_TRUCK
    ]),
    fuelType: getRandomElement([
      FuelType.GASOLINE,
      FuelType.DIESEL,
      FuelType.HYBRID,
      FuelType.ELECTRIC
    ]),
    transmission: getRandomElement([
      Transmission.AUTOMATIC,
      Transmission.MANUAL
    ]),
    engine: `${getRandomInt(10, 35) / 10}L ${getRandomInt(4, 8)}-cylinder`,
    exteriorColor: color,
    interiorColor: getRandomElement([...COLORS, 'Black', 'Beige']),
    description: `Well-maintained ${year} ${make} ${model} in excellent condition. ${getRandomElement([
      'Full service history available.',
      'Single owner.',
      'Low mileage for the year.',
      'All original paint.'
    ])}`,
    features: Array.from({ length: getRandomInt(3, 8) }, (_, i) => 
      getRandomElement([
        'Bluetooth', 'Navigation', 'Backup Camera', 'Leather Seats',
        'Sunroof', 'Heated Seats', 'Apple CarPlay', 'Android Auto',
        'Blind Spot Monitoring', 'Lane Keep Assist', 'Adaptive Cruise Control'
      ])
    ).filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
    photoUrls,
    status: CarStatus.AVAILABLE,
  };
}

function generateRandomCustomer() {
  const firstName = getRandomElement(FIRST_NAMES);
  const lastName = getRandomElement(LAST_NAMES);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  const phoneNumber = `+27${getRandomInt(60, 83)}${getRandomInt(1000000, 9999999)}`;
  
  return {
    cognitoId: `auth0|${Date.now()}${getRandomInt(1000, 9999)}`,
    name: `${firstName} ${lastName}`,
    email,
    phoneNumber,
    address: `${getRandomInt(1, 199)} ${getRandomElement(['Main', 'Oak', 'Pine', 'Maple', 'Cedar'])} St`,
    city: getRandomElement(CITIES),
    state: 'Gauteng',
    postalCode: `${getRandomInt(1000, 9999)}`,
    dateOfBirth: new Date(
      getRandomInt(1970, 2000),
      getRandomInt(0, 11),
      getRandomInt(1, 28)
    )
  };
}

async function createDealerships() {
  console.log('Creating dealerships...');
  const dealerships = [
    {
      name: 'Auto World Johannesburg',
      address: '123 Main Street',
      city: 'Johannesburg',
      state: 'Gauteng',
      country: 'South Africa',
      postalCode: '2000',
      phoneNumber: '+27123456789',
      email: 'johannesburg@autoworld.co.za',
      latitude: -26.2041,
      longitude: 28.0473
    },
    {
      name: 'Auto World Cape Town',
      address: '456 Beach Road',
      city: 'Cape Town',
      state: 'Western Cape',
      country: 'South Africa',
      postalCode: '8000',
      phoneNumber: '+27223456789',
      email: 'capetown@autoworld.co.za',
      latitude: -33.9249,
      longitude: 18.4241
    },
    {
      name: 'Auto World Durban',
      address: '789 Coastal Drive',
      city: 'Durban',
      state: 'KwaZulu-Natal',
      country: 'South Africa',
      postalCode: '4000',
      phoneNumber: '+27313456789',
      email: 'durban@autoworld.co.za',
      latitude: -29.8587,
      longitude: 31.0218
    }
  ];

  return await Promise.all(
    dealerships.map(data => prisma.dealership.create({ data }))
  );
}

async function createEmployees(dealerships: any[]) {
  console.log('Creating employees...');
  const employees = [];
  
  for (const dealership of dealerships) {
    // Create a manager for each dealership
    employees.push({
      cognitoId: `auth0|manager${dealership.id}`,
      name: `Manager ${dealership.city}`,
      email: `manager.${dealership.city.toLowerCase().replace(' ', '')}@autoworld.co.za`,
      phoneNumber: `+27${getRandomInt(60, 83)}${getRandomInt(1000000, 9999999)}`,
      role: EmployeeRole.SALES_MANAGER,
      status: EmployeeStatus.ACTIVE,
      dealershipId: dealership.id
    });

    // Create 2-4 sales associates per dealership
    const numAssociates = getRandomInt(2, 4);
    for (let i = 0; i < numAssociates; i++) {
      const firstName = getRandomElement(FIRST_NAMES);
      const lastName = getRandomElement(LAST_NAMES);
      employees.push({
        cognitoId: `auth0|${firstName.toLowerCase()}${lastName.toLowerCase()}${dealership.id}${i}`,
        name: `${firstName} ${lastName}`,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@autoworld.co.za`,
        phoneNumber: `+27${getRandomInt(60, 83)}${getRandomInt(1000000, 9999999)}`,
        role: EmployeeRole.SALES_ASSOCIATE,
        status: EmployeeStatus.ACTIVE,
        dealershipId: dealership.id,
        commission: getRandomInt(5, 15)
      });
    }
  }

  return await Promise.all(
    employees.map(data => prisma.employee.create({ data }))
  );
}

async function insertLocationData(dealerships: any[]) {
  for (const dealership of dealerships) {
    await prisma.dealership.create({
      data: dealership,
    });
  }
  console.log(`Seeded Dealership with data`);
}

async function resetSequence(modelName: string) {
  const quotedModelName = `"${toPascalCase(modelName)}"`;

  const maxIdResult = await (
    prisma[modelName as keyof PrismaClient] as any
  ).findMany({
    select: { id: true },
    orderBy: { id: "desc" },
    take: 1,
  });

  if (maxIdResult.length === 0) return;

  const nextId = maxIdResult[0].id + 1;
  await prisma.$executeRaw(
    Prisma.raw(`
    SELECT setval(pg_get_serial_sequence('${quotedModelName}', 'id'), coalesce(max(id)+1, ${nextId}), false) FROM ${quotedModelName};
  `)
  );
  console.log(`Reset sequence for ${modelName} to ${nextId}`);
}

async function deleteAllData(orderedFileNames: string[]) {
  const modelNames = orderedFileNames.map((fileName) => {
    return toPascalCase(path.basename(fileName, path.extname(fileName)));
  });

  for (const modelName of modelNames.reverse()) {
    const modelNameCamel = toCamelCase(modelName);
    const model = (prisma as any)[modelNameCamel];
    if (!model) {
      console.error(`Model ${modelName} not found in Prisma client`);
      continue;
    }
    try {
      await model.deleteMany({});
      console.log(`Cleared data from ${modelName}`);
    } catch (error) {
      console.error(`Error clearing data from ${modelName}:`, error);
    }
  }
}

async function main() {
  // 1. Create Dealerships
  const dealerships = await createDealerships();
  console.log('✅ Created', dealerships.length, 'dealerships.');

  // 2. Create Employees
  const employees = await createEmployees(dealerships);
  console.log('✅ Created', employees.length, 'employees.');

  // 3. Generate and insert demo customers
  console.log('🚗 Generating and inserting demo customers...');
  const demoCustomers = [];
  for (let i = 0; i < 10; i++) {
    const customer = generateRandomCustomer();
    demoCustomers.push(await prisma.customer.create({ data: customer }));
  }
  console.log(`✅ Inserted ${demoCustomers.length} demo customers.`);

  // 4. Generate and insert demo cars
  console.log('🚙 Generating and inserting demo cars...');
  const demoCars = [];
  for (let i = 0; i < 10; i++) {
    const car = generateRandomCar();
    // Assign a random dealershipId and (optionally) employeeId
    car.dealershipId = getRandomElement(dealerships).id;
    if (employees.length > 0) {
      car.employeeId = getRandomElement(employees).cognitoId;
    }
    demoCars.push(await prisma.car.create({ data: car }));
  }
  console.log(`✅ Inserted ${demoCars.length} demo cars.`);

  // You can continue with other seeding logic here (e.g., inquiries, reviews, etc.)
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
