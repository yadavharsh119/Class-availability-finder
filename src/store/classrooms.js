'use strict';

const AVAILABILITY_STATUSES = ['available', 'occupied', 'maintenance'];

const SAMPLE_CLASSROOMS = [
  { roomNumber: '101', building: 'Main Block', capacity: 60, timeSlot: '09:00-10:30', availability: 'available' },
  { roomNumber: '204', building: 'Main Block', capacity: 40, timeSlot: '11:00-12:30', availability: 'occupied' },
  { roomNumber: 'CS-301', building: 'Tech Block', capacity: 80, timeSlot: '14:00-15:30', availability: 'available' },
  { roomNumber: 'Lab-2', building: 'Tech Block', capacity: 30, timeSlot: '16:00-17:30', availability: 'maintenance' },
];

function createStore() {
  let nextId = 1;
  const classrooms = [];

  for (const sample of SAMPLE_CLASSROOMS) {
    classrooms.push({ id: nextId++, ...sample });
  }

  return {
    list() {
      return classrooms.map((room) => ({ ...room }));
    },

    get(id) {
      const found = classrooms.find((room) => room.id === id);
      return found ? { ...found } : undefined;
    },

    add({ roomNumber, building, capacity, timeSlot }) {
      const classroom = {
        id: nextId++,
        roomNumber,
        building,
        capacity,
        timeSlot,
        availability: 'available',
      };
      classrooms.push(classroom);
      return { ...classroom };
    },

    updateAvailability(id, availability) {
      const found = classrooms.find((room) => room.id === id);
      if (!found) return undefined;
      found.availability = availability;
      return { ...found };
    },
  };
}

module.exports = { createStore, AVAILABILITY_STATUSES };
