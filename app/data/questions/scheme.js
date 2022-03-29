import { createRequire } from 'node:module'
import clientGroups from './client-groups.js'

const require = createRequire(import.meta.url)
const schemes = require('../../datasets/generated/schemes.json')

const _getClientGroups = (groups) => {
  if (Array.isArray(clientGroups)) {
    const items = []
    groups.forEach(item => {
      item = String(item)
      const question = clientGroups.find(question => question.value === item)
      const text = question ? question.text : item
      items.push(text)
    })
    return items.join(', ')
  }
}

// Convert schemes to array
const schemeItems = []

Object.entries(schemes).forEach(([key, value]) => {
  // Show number of properties/property postcode as hint text
  const propertyCount = Object.entries(value.properties).length
  const hintText = propertyCount > 1
    ? `${propertyCount} properties`
    : `${value.properties[0].address}`

  // Add postcodes to search synonyms
  const synonyms = []
  Object.values(value.properties).map(property => {
    return synonyms.push(property.postcode)
  })

  schemeItems.push({
    text: value.name,
    value: value.id,
    hint: {
      text: hintText
    },
    attributes: {
      'data-append': hintText,
      'data-hint': _getClientGroups(value['client-groups']),
      'data-synonyms': synonyms
    }
  })
})

export default schemeItems
