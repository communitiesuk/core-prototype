import express from 'express'
import { accountRoutes } from './routes/account.js'
import { logRoutes } from './routes/logs.js'
import { organisationRoutes } from './routes/organisations.js'
import { schemeRoutes } from './routes/schemes.js'
import { userRoutes } from './routes/users.js'

const router = express.Router()

router.all('*', (req, res, next) => {
  const { data } = req.session

  // Set state
  if (data && data.account) {
    res.locals.isAdmin = data.account.role === 'admin'
    res.locals.isCoordinator = data.account.role === 'coordinator'

    // TODO: Better way of determining owning organisation
    res.locals.isOwningOrg = data.account.organisationId === 'LH3904'
  }

  // Set active section
  if (req.path.startsWith('/account')) {
    res.locals.activeSection = 'account'
  }

  next()
})

accountRoutes(router)
logRoutes(router)
schemeRoutes(router)
userRoutes(router)
organisationRoutes(router) // Must come after scheme and user routes

export default router
