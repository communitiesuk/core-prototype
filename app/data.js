import logs from './data/logs.js'
import questions from './data/questions.js'
import organisations from './data/organisations.js'
import roles from './data/roles.js'
import schemes from './data/schemes.js'
import users from './data/users.js'

export default async () => ({
  features: {
    '2022-23': {
      on: true,
      name: 'Use 2022/23 questions'
    }
  },
  logs,
  filter: {
    user: ['DP001'],
    collection: ['2022/23'],
    status: ['complete', 'incomplete', 'submitted', 'archived']
  },
  groups: [{
    id: 'before-you-start',
    title: 'Before you start'
  }, {
    id: 'tenancy',
    title: 'Property and tenancy information'
  }, {
    id: 'household',
    title: 'About the household'
  }, {
    id: 'finances',
    title: 'Finances'
  }],
  questions: await questions(),
  organisations,
  roles,
  schemes,
  statuses: {
    archived: {
      id: 'archived',
      text: 'Archived',
      colour: 'orange'
    },
    notStarted: {
      id: 'notStarted',
      text: 'Not started',
      colour: 'grey',
      canStart: true
    },
    inProgress: {
      id: 'inProgress',
      text: 'In progress',
      colour: 'blue',
      canStart: true
    },
    completed: {
      id: 'completed',
      text: 'Completed',
      colour: 'blue',
      canStart: true
    },
    submitted: {
      id: 'completed',
      text: 'Submitted',
      colour: 'green',
      canStart: true
    },
    cannotStart: {
      id: 'cannotStart',
      text: 'Cannot start yet',
      colour: 'grey'
    }
  },
  users
})
