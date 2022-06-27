import { wizard } from 'govuk-prototype-rig'
import * as utils from '../utils.js'
import localAuthorities from '../datasets/local-authorities.js'

const getSchemeWizardPaths = (req) => {
  const { schemeId } = req.params
  const schemePath = `/schemes/${schemeId}/`

  const journey = {
    [`${schemePath}details`]: {},
    [`${schemePath}primary-client-group`]: {},
    [`${schemePath}has-secondary-client-group`]: {
      // SKIP: Don’t ask for secondary client group if none needed
      [`${schemePath}support`]: {
        data: `schemes.${schemeId}['has-secondary-client-group']`,
        value: 'false'
      }
    },
    [`${schemePath}secondary-client-group`]: {},
    [`${schemePath}support`]: {},
    [`${schemePath}location/l1`]: {},
    [`${schemePath}check-your-answers`]: {}
  }
  return wizard(journey, req)
}

export const schemeRoutes = (router) => {
  /**
   * List all schemes (admin only)
   */
  router.get('/schemes', (req, res, next) => {
    if (!res.locals.isAdmin) {
      return res.redirect(`${res.locals.userOrganisationPath}/schemes`)
    }

    next()
  })

  /**
   * List schemes
   */
  router.all(['/schemes', '/organisations/:organisationId/schemes'], (req, res) => {
    let { organisations, schemes } = req.session.data
    const { organisationId } = req.params || 'OWNER'
    const organisation = organisations[organisationId]

    // Get schemes as array sorted by scheme name
    schemes = utils.objectToArray(schemes)
    schemes = utils.sortArray(schemes, 'name')

    // Scope schemes to organisation
    if (organisationId) {
      const organisationRelationships = [
        organisationId,
        ...(organisation.agents ? organisation.agents : [])
      ]

      // Only return users with a relationship with organisation
      schemes = schemes.filter(user => organisationRelationships
        .includes(user.organisationId)
      )
    }

    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit
    const results = schemes.slice(skip, skip + limit)
    const pagination = utils.getPaginationItems(
      page,
      limit,
      schemes.length
    )

    // Search query
    const q = req.query.q || req.body.q

    res.render('schemes/index', {
      query: req.query,
      q,
      organisation,
      organisations,
      results,
      pagination
    })
  })

  /**
   * List scheme locations
   */
  router.all('/schemes/:schemeId/locations', (req, res) => {
    const { schemes } = req.session.data
    const { schemeId } = req.params

    const scheme = schemes[schemeId]
    const schemePath = `/schemes/${schemeId}`

    // Get locations as array sorted by scheme name
    let locations = scheme.locations
    locations = utils.objectToArray(locations)
    locations = utils.sortArray(locations, 'postcode')

    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 50
    const skip = (page - 1) * limit
    const results = locations.slice(skip, skip + limit)
    const pagination = utils.getPaginationItems(
      page,
      limit,
      locations.length
    )

    // Search query
    const q = req.query.q || req.body.q

    res.render('schemes/locations', {
      query: req.query,
      q,
      scheme,
      schemePath,
      results,
      pagination
    })
  })

  /**
   * Scheme
   */
  router.all('/schemes/:schemeId/:view?/:itemId?', (req, res, next) => {
    res.locals.paths = getSchemeWizardPaths(req)
    next()
  })

  /**
   * Create scheme location
   */
  router.get('/schemes/:schemeId/location/new', (req, res) => {
    const { schemes } = req.session.data
    const { schemeId } = req.params

    const scheme = schemes[schemeId]
    const schemePath = `/schemes/${schemeId}`

    // Get an id for new location that hasn’t been used previously
    // (i.e for a deleted location)
    const lastLocation = utils.objectToArray(scheme.locations).at(-1)
    const lastLocationInt = Number(lastLocation.id.replace(/l([\d]*)/, '$1'))
    const nextItemId = `l${lastLocationInt + 1}`

    res.redirect(`${schemePath}/location/${nextItemId}`)
  })

  /**
   * Confirm delete scheme location
   */
  router.get('/schemes/:schemeId/location/:itemId/delete', (req, res) => {
    const { schemes } = req.session.data
    const { schemeId, itemId } = req.params
    const scheme = schemes[schemeId]
    const location = scheme.locations[itemId]
    const locationsPath = `/schemes/${schemeId}/locations`

    res.render('schemes/delete-location', {
      scheme,
      location,
      locationsPath
    })
  })

  /**
   * Update scheme location
   */
  router.post('/schemes/:schemeId/location/:itemId/:view', (req, res) => {
    const { schemes } = req.session.data
    const { schemeId, itemId, view } = req.params
    const scheme = schemes[schemeId]
    const location = scheme.locations[itemId]
    const locationsPath = `/schemes/${schemeId}/locations`

    if (view === 'update') {
      req.flash('success', `${location.postcode} has been updated.`)
      res.redirect(locationsPath)
    }

    if (view === 'delete') {
      delete scheme.locations[itemId]

      req.flash('success', 'Location has been deleted.')
      res.redirect(locationsPath)
    }
  })

  /**
   * Create scheme
   */
  router.get('/schemes/new', (req, res) => {
    const { account, schemes } = req.session.data
    const schemeId = utils.generateUniqueId()

    // Assign to user’s organisation (only DC at owning organisation can create)
    schemes[schemeId] = {
      created: new Date().toISOString(),
      draft: true,
      organisationId: account.organisationId
    }

    res.redirect(`/schemes/${schemeId}/details`)
  })

  /**
   * View scheme
   */
  router.get('/schemes/:schemeId/:view?/:itemId?', (req, res) => {
    const { organisations, schemes } = req.session.data
    const { itemId, schemeId } = req.params
    const view = req.params.view ? req.params.view : 'scheme'

    const scheme = utils.getEntityById(schemes, schemeId)
    const schemePath = `/schemes/${schemeId}`

    // Get organisation that owns scheme
    const organisationId = scheme.organisationId
    const organisation = utils.getEntityById(organisations, organisationId)

    // Admin can add schemes to any organisation
    const allOrganisations = utils.objectToArray(organisations)

    // Data coordinators can add schemes to own organisation and its children
    const agents = [organisation].concat(
      allOrganisations.filter(organisation => organisation.isAgent === 'true')
    )

    if (scheme) {
      res.render(`schemes/${view}`, {
        localAuthorities,
        organisations,
        agents,
        organisation,
        organisationId,
        itemId,
        scheme,
        schemes,
        schemePath
      })
    } else {
      res.redirect('/schemes')
    }
  })

  /**
   * Update scheme
   */
  router.post('/schemes/:schemeId/:view?', (req, res) => {
    const { schemes } = req.session.data
    const { schemeId, view } = req.params
    const scheme = schemes[schemeId]
    const schemePath = `/schemes/${schemeId}`

    // Add another location
    if (req.body['add-another-location'] === 'true') {
      const itemId = req.body['next-item-id']
      res.locals.paths.next = `${schemePath}/location/${itemId}`
    }

    // Confirm scheme
    if (view === 'check-your-answers') {
      delete schemes[schemeId].draft
      req.flash('success', `${scheme.name} has been created.`)
      res.locals.paths.next = schemePath
    }

    // Confirm scheme updates
    if (view === 'check-updated-answers') {
      res.locals.paths.next = `${schemePath}/update`
    }

    // Update scheme
    if (view === 'update') {
      req.flash('success', `${scheme.name} has been updated.`)
      res.locals.paths.next = schemePath
    }

    // Deactivate scheme
    if (view === 'deactivate') {
      scheme.deactivated = true
      req.flash('success', `${scheme.name} has been deactivated.`)
      res.locals.paths.next = schemePath
    }

    // Reactivate scheme
    if (view === 'reactivate') {
      scheme.deactivated = false
      req.flash('success', `${scheme.name} has been reactivated.`)
      res.locals.paths.next = schemePath
    }

    const next = res.locals.paths.next && res.locals.paths.next !== ''
      ? res.locals.paths.next
      : `${schemePath}/check-your-answers`

    res.redirect(next)
  })
}
