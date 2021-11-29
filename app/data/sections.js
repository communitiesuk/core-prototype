export default (log) => {
  const logPath = `/logs/${log.id}`

  const getPaths = (sectionId, paths) => {
    return paths.map(path => `${logPath}/${sectionId}/${path}`)
  }

  /**
   * About this log
   */
  const aboutThisLog = {
    id: 'about-this-log',
    title: 'About this log',
    group: 'before-you-start',
    paths: getPaths('about-this-log', [
      'gdpr',
      'organisation',
      'sale-or-letting',
      'letting-renewal',
      'letting-start-date',
      'letting-type',
      'tenant-code',
      'check-your-answers',
      'sale-completion-date',
      'purchaser-code',
      'check-your-answers'
    ]),
    forks: (sectionPath, keyPathRoot) => [{
      currentPath: `${sectionPath}/gdpr`,
      forkPath: `${sectionPath}/cannot-use-this-service`,
      storedData: keyPathRoot.concat('gdpr'),
      values: ['false']
    }, {
      currentPath: `${sectionPath}/sale-or-letting`,
      forkPath: `${sectionPath}/sale-completion-date`,
      storedData: keyPathRoot.concat('sale-or-letting'),
      values: ['sale']
    }]
  }

  /**
   * Household characteristics
   */
  const householdCharacteristics = {
    id: 'household-characteristics',
    title: 'Household characteristics',
    group: 'household',
    paths: getPaths('household-characteristics', [
      'number-in-household',
      'lead-tenant-age',
      'lead-tenant-gender',
      'lead-tenant-nationality',
      'lead-tenant-working-situation',
      'lead-tenant-check'
    ])
  }

  /**
   * Household situation
   */
  const householdSituation = {
    id: 'household-situation',
    title: 'Household situation',
    group: 'household',
    paths: getPaths('household-situation', [
      'previous-housing-situation',
      'previous-homelessness',
      'reason-for-leaving',
      'check-your-answers'
    ])
  }

  /**
   * Household needs
   */
  const householdNeeds = {
    id: 'household-needs',
    title: 'Household needs',
    group: 'household'
  }

  /**
   * Tenancy information
   */
  const tenancyInformation = {
    id: 'tenancy-information',
    title: 'Tenancy information',
    group: 'tenancy',
    paths: getPaths('tenancy-information', [
      'start-date',
      'is-starter',
      'type-of-tenancy',
      'check-your-answers'
    ])
  }

  /**
   * Property information
   */

  // General needs && not a renewal
  const propertyInformation = {
    id: 'property-information',
    title: 'Property information',
    group: 'tenancy',
    paths: getPaths('property-information', [
      'reference',
      'postcode',
      // ↳ Local authority if cannot be inferred from postcode
      'local-authority-known',
      'local-authority',
      // ↳ No postcode or local authority known
      'why-dont-you-know-postcode-or-la',
      'is-relet',
      'type-of-let',
      'reason-for-vacancy',
      'times-previously-offered',
      'type-of-unit',
      'type-of-property',
      'is-adapted',
      'number-of-bedrooms',
      'void-date',
      'repairs',
      'check-your-answers'
    ]),
    forks: (sectionPath, keyPathRoot) => [{
      currentPath: `${sectionPath}/postcode`,
      forkPath: `${sectionPath}/is-relet`,
      storedData: keyPathRoot.concat('postcode-known'),
      values: ['true']
    }, {
      currentPath: `${sectionPath}/local-authority-known`,
      forkPath: `${sectionPath}/why-dont-you-know-postcode-or-la`,
      storedData: keyPathRoot.concat('local-authority-known'),
      values: ['false']
    }, {
      currentPath: `${sectionPath}/local-authority`,
      forkPath: `${sectionPath}/is-relet`,
      storedData: keyPathRoot.concat('local-authority-known'),
      values: ['true']
    }, {
      currentPath: `${sectionPath}/is-relet`,
      forkPath: `${sectionPath}/reason-for-vacancy-non-relet`,
      storedData: keyPathRoot.concat('is-relet'),
      values: ['false']
    }, {
      currentPath: `${sectionPath}/reason-for-vacancy-non-relet`,
      skipTo: `${sectionPath}/times-previously-offered`
    }, {
      currentPath: `${sectionPath}/void-date`,
      forkPath: `${sectionPath}/check-your-answers`,
      storedData: keyPathRoot.concat('reason-for-non-relet'),
      values: ['newprop']
    }]
  }

  // General needs && renewal
  const propertyInformationRenewal = {
    id: 'property-information-renewal',
    title: 'Property information',
    group: 'tenancy',
    paths: getPaths('property-information-renewal', [
      'reference',
      'postcode',
      // ↳ Local authority if cannot be inferred from postcode
      'local-authority-known',
      'local-authority',
      // ↳ No postcode or local authority known
      'why-dont-you-know-postcode-or-la',
      'type-of-unit',
      'type-of-property',
      'is-adapted',
      'number-of-bedrooms',
      'void-date',
      'repairs',
      'check-your-answers'
    ]),
    forks: (sectionPath, keyPathRoot) => [{
      currentPath: `${sectionPath}/postcode`,
      forkPath: `${sectionPath}/type-of-unit`,
      storedData: keyPathRoot.concat('postcode-known'),
      values: ['true']
    }, {
      currentPath: `${sectionPath}/local-authority-known`,
      forkPath: `${sectionPath}/why-dont-you-know-postcode-or-la`,
      storedData: keyPathRoot.concat('local-authority-known'),
      values: ['false']
    }, {
      currentPath: `${sectionPath}/local-authority`,
      forkPath: `${sectionPath}/type-of-unit`,
      storedData: keyPathRoot.concat('local-authority-known'),
      values: ['true']
    }, {
      currentPath: `${sectionPath}/reason-for-vacancy-non-relet`,
      skipTo: `${sectionPath}/times-previously-offered`
    }, {
      currentPath: `${sectionPath}/void-date`,
      forkPath: `${sectionPath}/check-your-answers`,
      storedData: keyPathRoot.concat('reason-for-non-relet'),
      values: ['newprop']
    }]
  }

  // Supported housing && not a renewal
  const propertyInformationSupportedHousing = {
    id: 'property-information-supported-housing',
    title: 'Property information',
    group: 'tenancy',
    paths: getPaths('property-information-supported-housing', [
      'reference',
      'postcode',
      // ↳ Local authority if cannot be inferred from postcode
      'local-authority-known',
      'local-authority',
      // ↳ No postcode or local authority known
      'why-dont-you-know-postcode-or-la',
      'is-relet',
      'type-of-let',
      'reason-for-vacancy',
      'times-previously-offered',
      'type-of-unit',
      'type-of-property',
      'is-adapted',
      'number-of-bedrooms',
      'void-date',
      'repairs',
      'check-your-answers'
    ]),
    forks: (sectionPath, keyPathRoot) => [{
      currentPath: `${sectionPath}/postcode`,
      forkPath: `${sectionPath}/is-relet`,
      storedData: keyPathRoot.concat('postcode-known'),
      values: ['true']
    }, {
      currentPath: `${sectionPath}/local-authority-known`,
      forkPath: `${sectionPath}/why-dont-you-know-postcode-or-la`,
      storedData: keyPathRoot.concat('local-authority-known'),
      values: ['false']
    }, {
      currentPath: `${sectionPath}/local-authority`,
      forkPath: `${sectionPath}/is-relet`,
      storedData: keyPathRoot.concat('local-authority-known'),
      values: ['true']
    }, {
      currentPath: `${sectionPath}/is-relet`,
      forkPath: `${sectionPath}/reason-for-vacancy-non-relet`,
      storedData: keyPathRoot.concat('is-relet'),
      values: ['false']
    }, {
      currentPath: `${sectionPath}/reason-for-vacancy-relet`,
      skipTo: `${sectionPath}/is-adapted`
    }, {
      currentPath: `${sectionPath}/reason-for-vacancy-non-relet`,
      skipTo: `${sectionPath}/is-adapted`
    }]
  }

  // Supported housing && renewal
  const propertyInformationSupportedHousingRenewal = {
    id: 'property-information-supported-housing-renewal',
    title: 'Property information',
    group: 'tenancy',
    paths: getPaths('property-information-supported-housing-renewal', [
      'reference',
      'postcode',
      // ↳ Local authority if cannot be inferred from postcode
      'local-authority-known',
      'local-authority',
      // ↳ No postcode or local authority known
      'why-dont-you-know-postcode-or-la',
      'type-of-unit',
      'type-of-property',
      'is-adapted',
      'check-your-answers'
    ]),
    forks: (sectionPath, keyPathRoot) => [{
      currentPath: `${sectionPath}/postcode`,
      forkPath: `${sectionPath}/type-of-unit`,
      storedData: keyPathRoot.concat('postcode-known'),
      values: ['true']
    }, {
      currentPath: `${sectionPath}/local-authority-known`,
      forkPath: `${sectionPath}/why-dont-you-know-postcode-or-la`,
      storedData: keyPathRoot.concat('local-authority-known'),
      values: ['false']
    }, {
      currentPath: `${sectionPath}/local-authority`,
      forkPath: `${sectionPath}/type-of-unit`,
      storedData: keyPathRoot.concat('local-authority-known'),
      values: ['true']
    }]
  }

  /**
   * Income and benefits
   */
  const incomeAndBenefits = {
    id: 'income-and-benefits',
    title: 'Income and benefits',
    group: 'rent'
  }

  /**
   * Rent
   */
  const rent = {
    id: 'rent',
    title: 'Rent',
    group: 'rent'
  }

  /**
   * Local authority
   */
  const localAuthority = {
    id: 'local-authority',
    title: 'Local authority',
    group: 'local-authority'
  }

  /**
   * Local authority
   */
  const declaration = {
    id: 'declaration',
    title: 'Declaration',
    group: 'submission'
  }

  // Answers to questions in ‘About this log’ affect questions shown in task list
  let isSupportedHousing
  let isRenewal
  if (log['about-this-log']) {
    isSupportedHousing = log['about-this-log']['type-of-need'] === 'supported-housing'
    isRenewal = log['about-this-log']['letting-renewal'] === 'true'
  }

  return [
    aboutThisLog,
    householdCharacteristics,
    householdSituation,
    householdNeeds,
    tenancyInformation,
    ...(!isSupportedHousing && !isRenewal ? [propertyInformation] : []),
    ...(!isSupportedHousing && isRenewal ? [propertyInformationRenewal] : []),
    ...(isSupportedHousing && !isRenewal ? [propertyInformationSupportedHousing] : []),
    ...(isSupportedHousing && isRenewal ? [propertyInformationSupportedHousingRenewal] : []),
    incomeAndBenefits,
    rent,
    localAuthority,
    declaration
  ]
}
