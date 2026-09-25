'use strict';

function validateClassroom(input) {
  const errors = [];

  const roomNumber = String(input.roomNumber || '').trim();
  const building = String(input.building || '').trim();
  const timeSlot = String(input.timeSlot || '').trim();
  const capacityRaw = String(input.capacity || '').trim();

  if (!roomNumber) {
    errors.push('Room number is required.');
  } else if (roomNumber.length > 20) {
    errors.push('Room number must be 20 characters or fewer.');
  }

  if (!building) {
    errors.push('Building is required.');
  } else if (building.length > 60) {
    errors.push('Building must be 60 characters or fewer.');
  }

  if (!capacityRaw) {
    errors.push('Capacity is required.');
  } else {
    const capacity = Number(capacityRaw);
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 500) {
      errors.push('Capacity must be a whole number between 1 and 500.');
    }
  }

  if (!timeSlot) {
    errors.push('Time slot is required.');
  } else if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(timeSlot)) {
    errors.push('Time slot must use the format HH:MM-HH:MM (e.g. 09:00-10:30).');
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    value: {
      roomNumber,
      building,
      capacity: Number(capacityRaw),
      timeSlot,
    },
  };
}

module.exports = { validateClassroom };
