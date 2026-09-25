'use strict';

const express = require('express');
const { validateClassroom } = require('../validation/classroom');
const { AVAILABILITY_STATUSES } = require('../store/classrooms');

function pagesRouter() {
  const router = express.Router();

  router.get('/', (req, res) => {
    const search = (req.query.search || '').trim();
    const availability = req.query.availability || '';
    const validAvailability = AVAILABILITY_STATUSES.includes(availability) ? availability : '';

    let classrooms = req.store.list();

    if (search) {
      const q = search.toLowerCase();
      classrooms = classrooms.filter((room) =>
        room.roomNumber.toLowerCase().includes(q)
        || room.building.toLowerCase().includes(q),
      );
    }

    if (validAvailability) {
      classrooms = classrooms.filter((room) => room.availability === validAvailability);
    }

    res.render('pages/index', {
      classrooms,
      statuses: AVAILABILITY_STATUSES,
      notice: req.query.notice || '',
      errors: (req.query.error || '').split('|').filter(Boolean),
      search,
      availability: validAvailability,
      commitId: req.commitId,
    });
  });

  router.post('/classrooms', (req, res) => {
    const { errors, value } = validateClassroom(req.body);
    if (errors) {
      return res.redirect(`/?error=${encodeURIComponent(errors.join(' | '))}`);
    }
    const classroom = req.store.add(value);
    return res.redirect(`/?notice=${encodeURIComponent(`Added classroom ${classroom.roomNumber} (${classroom.building}).`)}`);
  });

  router.post('/classrooms/:id/availability', (req, res) => {
    const id = Number(req.params.id);
    const { availability } = req.body;

    if (!Number.isInteger(id) || !req.store.get(id)) {
      return res.redirect(`/?error=${encodeURIComponent('Classroom not found.')}`);
    }
    if (!AVAILABILITY_STATUSES.includes(availability)) {
      return res.redirect(`/?error=${encodeURIComponent(`Availability must be one of: ${AVAILABILITY_STATUSES.join(', ')}.`)}`);
    }

    req.store.updateAvailability(id, availability);
    return res.redirect(`/?notice=${encodeURIComponent(`Updated classroom #${id} to "${availability}".`)}`);
  });

  return router;
}

module.exports = pagesRouter;
