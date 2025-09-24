const fs = require('fs')
const path = require('path')

// Files to add "use client" directive to
const files = [
  'dist/index.esm.js',
  'dist/index.js'
]

files.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8')
    
    // Check if "use client" is already present
    if (!content.startsWith('"use client"') && !content.startsWith("'use client'")) {
      const newContent = '"use client";\n' + content
      fs.writeFileSync(file, newContent, 'utf8')
      console.log(`Added "use client" to ${file}`)
    } else {
      console.log(`"use client" already present in ${file}`)
    }
  } else {
    console.log(`File ${file} not found`)
  }
})