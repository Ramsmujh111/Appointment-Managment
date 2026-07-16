import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../config/database';
import { Slot } from '../entity/Slot';

// Generates appointment slots for the next 14 days.
// Each day gets slots from 9:00 AM to 5:00 PM in 1-hour blocks.
// Run with: npm run seed

async function seed() {

  // make the initial data source - for 
  await AppDataSource.initialize();
  // get slot repo
  const slotRepo = AppDataSource.getRepository(Slot);
  // make the array to store the slots
  const slots: Partial<Slot>[] = [];
  const today = new Date();

  // loop for the 14 days
  for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // 9 AM to 5 PM: creates 8 slots per day
    for (let hour = 9; hour < 17; hour++) {
      const start = `${String(hour).padStart(2, '0')}:00:00`;
      const end = `${String(hour + 1).padStart(2, '0')}:00:00`;

      // Avoid duplicates if seed is run multiple times
      const exists = await slotRepo.findOne({ where: { date: dateStr, start_time: start } });
      if (!exists) {
        slots.push({ date: dateStr, start_time: start, end_time: end });
      }
    }
  }

  if (slots.length > 0) {
    await slotRepo.save(slots as Slot[]);
    console.log(`Seeded ${slots.length} slots`);
  } else {
    console.log('All slots already exist — nothing to seed');
  }

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
