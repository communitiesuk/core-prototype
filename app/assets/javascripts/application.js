// Sass entry point for rollup.js
import '../stylesheets/application.scss'

// Import GOV.UK Frontend
import { initAll as govukFrontend } from 'govuk-frontend'

// Import GOV.UK Prototype Components
import GOVUKPrototypeComponents from 'govuk-prototype-components'

// Add app components to GOV.UK Prototype Components
import AddAnother from '../../components/add-another/add-another.js'
import Autocomplete from '../../components/autocomplete/autocomplete.js'
import FilterLayout from '../../components/filter-layout/filter-layout.js'
import Output from '../../components/output/output.js'

// Add app components to GOVUKPrototypeComponents object
GOVUKPrototypeComponents.AddAnother = AddAnother
GOVUKPrototypeComponents.Autocomplete = Autocomplete
GOVUKPrototypeComponents.Output = Output
GOVUKPrototypeComponents.FilterLayout = FilterLayout

// Initiate scripts on page load
document.addEventListener('DOMContentLoaded', () => {
  govukFrontend()
  GOVUKPrototypeComponents.initAll()
})
