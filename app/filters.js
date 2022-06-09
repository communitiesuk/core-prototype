import _ from 'lodash'
import * as utils from './utils.js'

/**
 * Prototype specific filters for use in Nunjucks templates.
 */
export default (env) => {
  const filters = {}

  /**
   * Covert saved value to human readable text
   *
   * @example 'fixed-secure' => Fixed term – Secure
   *
   * @param {object|String|Array} value Value entered/chosen
   * @param {object} questions Question data
   * @return {String} Formatted answer
   */
  filters.textFromInputValue = (value, questions) => {
    const safe = env.getFilter('safe')
    const isoDateFromDateInput = env.getFilter('isoDateFromDateInput')

    const noValueProvidedText = safe('<span class="app-!-colour-muted">You didn’t answer this question</span>')

    // Nunjucks sometimes returns an object with an empty value
    if (!value || value.val === '') {
      return noValueProvidedText
    }

    // Use structured answer from question data
    // (If no structured answer found, return given value)
    if (questions) {
      // Multiple structured answers (from checkboxes)
      if (Array.isArray(value)) {
        const items = []
        value.forEach(item => {
          item = String(item)
          const question = questions.find(question => question.value === item)
          const text = question ? question.answer || question.text : item
          items.push(text)
        })
        return items.join(', ')
      }

      // Single structured answer (from radio)
      value = String(value)
      const question = questions.find(question => question.value === value)
      return question ? question.answer || question.text : value
    }

    // Dates
    // (We’ll assume only dates are objects, for now)
    if (typeof value === 'object' && !Array.isArray(value)) {
      const date = isoDateFromDateInput(value)
      return date !== 'Invalid DateTime' ? date : false
    }

    return value
  }

  filters.selectwhere = (array, key, compare) => {
    compare = [].concat(compare) // Force to Array

    const filtered = array.filter(item => {
      return compare.includes(_.get(item, key))
    })

    return filtered
  }

  filters.rejectwhere = (array, key, compare) => {
    compare = [].concat(compare) // Force to Array

    const filtered = array.filter(item => {
      return !compare.includes(_.get(item, key))
    })

    return filtered
  }

  filters.ordinal = (number) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = number % 100
    return number + (s[(v - 20) % 10] || s[v] || s[0])
  }

  filters.optionItems = (array, text, value, hint = false) => {
    text = text || 'name'
    value = value || 'id'

    if (!Array.isArray(array)) {
      array = utils.objectToArray(array)
    }

    if (array.length > 1) {
      array = array.sort((a, b) => {
        const fa = a[text].toLowerCase()
        const fb = b[text].toLowerCase()

        if (fa < fb) { return -1 }
        if (fa > fb) { return 1 }
        return 0
      })
    }

    array = array.map(item => ({
      text: item[text],
      value: item[value],
      ...(hint && {
        hint: {
          html: item[hint]
        }
      })
    }))

    return array
  }

  // Used in Household Characteristics, this only supports `first` through
  // `eighth` at the moment this is a prototype, so lets not guild the lilly.
  filters.numberToOrdinal = int => {
    int = parseInt(int)
    const ordinals = [
      'first',
      'second',
      'third',
      'fourth',
      'fifth',
      'sixth',
      'seventh',
      'eighth'
    ]

    return int <= 8 ? ordinals[int - 1] : int
  }

  // Convert object saved by govukDateInput to ISO-8601 formatted date
  filters.dateObjectToIso = object => {
    if (typeof object === 'string') {
      return object
    }

    let day = object.day || 1
    day = day.padStart(2, '0')

    let month = object.month || 1
    month = day.padStart(2, '0')

    let year = object.year || 1970
    year = year.padStart(4, '0')

    return `${year}-${month}-${day}`
  }

  return filters
}
