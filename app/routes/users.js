import * as utils from '../utils.js'

export const userRoutes = (router) => {
  /**
   * List all users (admin only)
   */
  router.get('/users', (req, res, next) => {
    if (!res.locals.isAdmin) {
      return res.redirect(`${res.locals.userOrganisationPath}/users`)
    }

    next()
  })

  /**
   * List users
   */
  router.all(['/users', '/organisations/:organisationId/users'], (req, res) => {
    let { organisations, users } = req.session.data
    const { organisationId } = req.params

    // Get users as array
    users = utils.objectToArray(users)

    // Scope users to organisation
    if (organisationId) {
      const organisation = organisations[organisationId]
      const organisationRelationships = [
        organisationId,
        ...(organisation.children ? organisation.children : [])
      ]

      // Only return users with a relationship with organisation
      users = users.filter(user => organisationRelationships
        .includes(user.organisationId)
      )
    }

    res.render('users/index', {
      query: req.query,
      users
    })
  })

  /**
   * Create user
   */
  router.get('/users/new', (req, res) => {
    const { users } = req.session.data
    const userId = utils.generateUniqueId()

    users[userId] = {}

    res.redirect(`/users/${userId}/personal-details`)
  })

  /**
   * View user
   */
  router.get('/users/:userId/:view?', (req, res) => {
    const { account, organisations, users } = req.session.data
    const { userId } = req.params
    const view = req.params.view ? req.params.view : 'user'

    const user = utils.getEntityById(users, userId)
    const userPath = `/users/${userId}`

    // Get organisation that user belongs to
    const organisationId = account.organisationId
    const organisation = utils.getEntityById(organisations, organisationId)

    // Admin can add users to any organisation
    const allOrganisations = utils.objectToArray(organisations)

    // Data coordinators can add users to own organisation and its children
    const managedOrganisations = [organisation].concat(
      allOrganisations.filter(organisation => {
        if (organisation.parents) {
          return organisation.parents.includes(organisationId)
        }

        return false
      })
    )

    if (user) {
      res.render(`users/${view}`, {
        query: req.query,
        allOrganisations,
        managedOrganisations,
        user,
        users,
        userPath
      })
    } else {
      res.redirect('/users')
    }
  })

  /**
   * Delete user
   */
  router.post('/users/:userId/delete', (req, res) => {
    const { users } = req.session.data
    const { userId } = req.params

    delete users[userId]

    res.redirect('/users?success=deleted')
  })

  /**
   * Update user
   */
  router.post('/users/:userId/:view?', (req, res, next) => {
    const { users } = req.session.data
    const { userId, view } = req.params

    const userPath = `/users/${userId}`

    // Deactivate user
    if (view === 'deactivate') {
      users[userId].deactivated = true
      return res.redirect(userPath)
    }

    // Reactivate user
    if (view === 'reactivate') {
      users[userId].deactivated = false
      return res.redirect(userPath)
    }

    next()
  })
}
