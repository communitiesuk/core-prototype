import { validationResult } from 'express-validator'
import { wizard } from 'govuk-prototype-rig'

import { sections as getSections } from '../data/sections.js'
import * as utils from '../utils.js'
import { validations } from '../validations.js'

export const logRoutes = (router) => {
  /**
   * List logs
   */
  router.get('/logs', (req, res) => {
    let { account, logs } = req.session.data

    // Convert organisations to array
    logs = utils.objectToArray(logs)

    // Redirect to home page if signed out
    if (!account) {
      res.redirect('/')
    } else {
      res.render('logs/index', {
        query: req.query,
        logs
      })
    }
  })

  /**
   * Create new log
   */
  router.post('/logs/create', (req, res) => {
    const { account, logs, type } = req.session.data
    const logId = utils.generateUniqueId()

    // Create a new blank log in session data
    logs[logId] = {
      type,
      updated: new Date().toISOString(),
      updatedBy: account
    }

    res.redirect(`/logs/${logId}/`)
  })

  /**
   * View log
   */
  router.get('/logs/:logId', (req, res) => {
    const { logId } = req.params
    const { logs } = req.session.data

    const log = utils.getEntityById(logs, logId)
    const sections = getSections(log)

    if (log) {
      res.render('logs/log', { log, sections })
    } else {
      res.redirect('/logs')
    }
  })

  /**
   * Submit log
   */
  router.post('/logs/:logId/submit/check', (req, res, next) => {
    const { logId } = req.params
    const { account, logs } = req.session.data

    // Update log with derived and meta data
    logs[logId].postcode = logs[logId]['property-information']?.postcode ||
    logs[logId]['property-information-renewal']?.postcode ||
    logs[logId]['property-information-supported-housing']?.postcode
    logs[logId].submit = {
      completed: 'true'
    }
    logs[logId].submitted = true
    logs[logId].updated = new Date().toISOString()
    logs[logId].updatedBy = account

    res.redirect(`/logs/?success=submitted-log&logId=${logId}`)
  })

  /**
   * View log section
   */
  router.get('/logs/:logId/:sectionId', (req, res, next) => {
    try {
      const { logId, sectionId } = req.params
      const { logs } = req.session.data

      const log = utils.getEntityById(logs, logId)
      const section = utils.getById(getSections(log), sectionId)

      if (log[sectionId]) {
        res.redirect(`/logs/${logId}/${sectionId}/check-your-answers`)
      } else {
        res.redirect(section.paths[0])
      }
    } catch (error) {
      next(error)
    }
  })

  /**
   * View log section question
   */
  router.all('/logs/:logId/:sectionId/:itemId?/:view?', async (req, res, next) => {
    try {
      let { logId, sectionId, itemId, view } = req.params
      const { logs } = req.session.data

      // If there’s no :view param, use :itemId param for view
      if (!view) {
        view = itemId
      }

      // Some sections have variants that share common views
      let sectionViewsDir = sectionId
      if (sectionId.startsWith('household-situation')) {
        sectionViewsDir = 'household-situation'
      }
      if (sectionId.startsWith('tenancy-information')) {
        sectionViewsDir = 'tenancy-information'
      }
      if (sectionId.startsWith('property-information')) {
        sectionViewsDir = 'property-information'
      }
      if (sectionId.startsWith('finances')) {
        sectionViewsDir = 'finances'
      }

      const log = utils.getEntityById(logs, logId)
      const logPath = `/logs/${logId}`
      const section = utils.getById(getSections(log), sectionId)
      const sectionPath = `/logs/${logId}/${sectionId}`

      // Fork if next path is a fork
      const sectionKeyPath = `logs[${logId}][${sectionId}]`
      const sectionForks = section?.forks
        ? section.forks(sectionPath, sectionKeyPath, req)
        : []
      const fork = sectionForks
        ? wizard.nextForkPath(sectionForks, req)
        : false

      // Calculate back and next paths
      const paths = section.paths
        ? wizard.nextAndBackPaths(section.paths, req)
        : []

      // Common render options, shared between normal and validated view
      let renderOptions = {
        caption: section.title,
        log,
        logPath,
        section,
        sectionPath,
        itemId,
        paths
      }

      if (req.method === 'POST') {
        // Check if any fields on the page require validation
        const fieldsToValidate = validations(req).logs[sectionId]?.[view]
        if (fieldsToValidate) {
          await Promise.all(fieldsToValidate.map(validation => validation.run(req)))
        }

        // Check if we have any validation errors
        const errors = validationResult(req)
        if (errors.isEmpty()) {
          // If next path is empty, this is the last path so redirect to check answers page
          const next = paths.next !== ''
            ? paths.next
            : `${sectionPath}/check-your-answers`

          fork ? res.redirect(fork) : res.redirect(next)
        } else {
          renderOptions = { ...renderOptions, ...{ errors: errors.mapped() } }
          res.render(`logs/${sectionViewsDir}/${view}`, renderOptions)
        }
      } else {
        res.render(`logs/${sectionViewsDir}/${view}`, renderOptions)
      }
    } catch (error) {
      next(error)
    }
  })
}
